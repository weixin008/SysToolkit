import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { PortInfo } from '../../types/port';

interface PortCardProps {
  port: PortInfo;
}

const PortCard: React.FC<PortCardProps> = ({ port }) => {
  const [isKilling, setIsKilling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const getPortIcon = () => {
    if (port.project) {
      switch (port.project.project_type) {
        case 'React':
          return '';
        case 'Vue':
          return '';
        case 'Node.js':
          return '';
        case 'Docker':
          return '';
        case 'Database':
          return '';
        default:
          return '';
      }
    }
    return '';
  };

  const getPortTitle = () => {
    if (port.project) {
      return `${port.port} - ${port.project.name}`;
    }
    return `${port.port} - ${port.process.name}`;
  };

  const handleKillProcess = async () => {
    try {
      setIsKilling(true);
      setError(null);
      
      const success = await invoke<boolean>('kill_process', { pid: port.process.pid });
      
      if (success) {
        // 可以通过回调通知父组件刷新
        console.log('进程已终止');
      } else {
        setError('无法终止进程，可能需要管理员权限');
      }
    } catch (err) {
      console.error('终止进程失败:', err);
      setError('终止进程失败: ' + err);
    } finally {
      setIsKilling(false);
    }
  };

  const handleOpenBrowser = () => {
    // 使用Tauri API打开浏览器
    window.open(`http://localhost:${port.port}`, '_blank');
  };

  const toggleMoreOptions = () => {
    setShowMoreOptions(!showMoreOptions);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            {getPortIcon()} 端口 {getPortTitle()}
          </h3>
          
          {port.project && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">项目：</span>
                {port.project.name}
              </p>
              {port.project.path && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">路径：</span>
                  {port.project.path}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">状态：</span>
                <span className="status-indicator status-green"></span>
                正常运行
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">说明：</span>
                {port.project.description}
              </p>
              
              {/* Docker容器关联信息 */}
              {port.project.project_type === 'Docker' && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Docker容器映射</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    <span className="font-medium">容器端口:</span> {port.port} → 宿主机端口: {port.port}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    <span className="font-medium">容器名称:</span> {port.project.name}
                  </p>
                  <button 
                    className="text-xs text-blue-700 dark:text-blue-300 underline mt-1 hover:text-blue-900 dark:hover:text-blue-100"
                    onClick={() => window.open(`/docker?container=${encodeURIComponent(port.project?.name || '')}`, '_self')}
                  >
                    查看容器详情 →
                  </button>
                </div>
              )}
            </div>
          )}

          {!port.project && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">进程：</span>
                {port.process.name} (PID: {port.process.pid})
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">协议：</span>
                {port.protocol}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">状态：</span>
                <span className="status-indicator status-yellow"></span>
                {port.status}
              </p>
            </div>
          )}

          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-semibold mb-2">详细信息</h4>
              <p className="text-sm text-gray-600">
                <span className="font-medium">PID：</span>
                {port.process.pid}
              </p>
              {port.process.exe_path && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">可执行文件：</span>
                  {port.process.exe_path}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <span className="font-medium">命令行：</span>
                <span className="text-xs font-mono bg-gray-100 p-1 rounded">
                  {port.process.cmd.join(' ')}
                </span>
              </p>
            </div>
          )}

          {showMoreOptions && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-semibold mb-2">更多操作</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="btn btn-secondary text-sm py-1"
                  onClick={() => navigator.clipboard.writeText(`${port.port}`)}
                >
                  📋 复制端口号
                </button>
                <button 
                  className="btn btn-secondary text-sm py-1"
                  onClick={() => navigator.clipboard.writeText(`localhost:${port.port}`)}
                >
                  🔗 复制地址
                </button>
                <button 
                  className="btn btn-secondary text-sm py-1"
                  onClick={() => navigator.clipboard.writeText(port.process.name)}
                >
                  📝 复制进程名
                </button>
                <button 
                  className="btn btn-secondary text-sm py-1"
                  onClick={() => navigator.clipboard.writeText(`PID: ${port.process.pid}`)}
                >
                  🆔 复制PID
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <button
          className="text-gray-400 hover:text-gray-600"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '' : ''}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="btn btn-danger"
          onClick={handleKillProcess}
          disabled={isKilling}
        >
           停止服务
        </button>

        {port.project && (
          <>
            <button className="btn btn-secondary">
               重启
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={handleOpenBrowser}
            >
               打开浏览器
            </button>
          </>
        )}

        <button 
          className={`btn ${showMoreOptions ? 'btn-primary' : 'btn-secondary'}`}
          onClick={toggleMoreOptions}
        >
           {showMoreOptions ? '收起' : '更多'}
        </button>
      </div>
    </div>
  );
};

export default PortCard;
