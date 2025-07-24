import React, { useState } from 'react';
import { DetailedProcessInfo } from '../../types/process';

interface ProcessCardProps {
  process: DetailedProcessInfo;
  onKill: (pid: number) => void;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ process, onKill }) => {
  const [expanded, setExpanded] = useState(false);
  const [confirmKill, setConfirmKill] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatTime = (timestamp: number) => {
    // 检查时间戳是否为秒级（Rust可能返回秒级时间戳）
    // 如果时间戳小于年份2000（946684800000），则认为是秒级时间戳
    const adjustedTimestamp = timestamp < 946684800000 ? timestamp * 1000 : timestamp;
    const date = new Date(adjustedTimestamp);
    return date.toLocaleString();
  };

  const getProcessIcon = () => {
    switch (process.name.toLowerCase()) {
      case 'chrome.exe':
        return '';
      case 'node.exe':
        return '';
      case 'explorer.exe':
        return '';
      case 'svchost.exe':
        return '';
      case 'vscode.exe':
        return '';
      default:
        return '';
    }
  };

  const isSystemProcess = () => {
    const systemProcesses = [
      'svchost.exe',
      'explorer.exe',
      'lsass.exe',
      'winlogon.exe',
      'csrss.exe',
      'services.exe',
      'smss.exe',
      'wininit.exe',
      'system',
    ];
    
    return systemProcesses.includes(process.name.toLowerCase());
  };

  const handleKillClick = () => {
    if (isSystemProcess()) {
      setConfirmKill(true);
    } else {
      onKill(process.pid);
    }
  };

  const handleConfirmKill = () => {
    onKill(process.pid);
    setConfirmKill(false);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <span className="mr-2">{getProcessIcon()}</span>
            {process.name} (PID: {process.pid})
          </h3>
          
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">CPU使用率：</span>
              <span className={process.cpu_usage > 10 ? 'text-red-600 font-medium' : ''}>
                {process.cpu_usage.toFixed(1)}%
              </span>
            </p>
            
            <p className="text-sm text-gray-600">
              <span className="font-medium">内存使用：</span>
              <span className={process.memory_usage > 500 * 1024 * 1024 ? 'text-red-600 font-medium' : ''}>
                {formatMemory(process.memory_usage)}
              </span>
            </p>
            
            <p className="text-sm text-gray-600">
              <span className="font-medium">状态：</span>
              {process.status}
            </p>
            
            <p className="text-sm text-gray-600">
              <span className="font-medium">启动时间：</span>
              {formatTime(process.start_time)}
            </p>
          </div>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-semibold mb-2">详细信息</h4>
              
              {process.exe_path && (
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">可执行文件：</span>
                  <span className="text-xs font-mono bg-gray-100 p-1 rounded">
                    {process.exe_path}
                  </span>
                </p>
              )}
              
              <p className="text-sm text-gray-600">
                <span className="font-medium">命令行：</span>
                <span className="text-xs font-mono bg-gray-100 p-1 rounded block mt-1">
                  {process.cmd.join(' ')}
                </span>
              </p>
            </div>
          )}
          
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-semibold mb-2">进程详情</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-1">基本信息</h5>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">进程ID：</span> {process.pid}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">名称：</span> {process.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">状态：</span> {process.status}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">启动时间：</span> {formatTime(process.start_time)}
                  </p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-1">资源使用</h5>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">CPU使用率：</span> {process.cpu_usage.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">内存使用：</span> {formatMemory(process.memory_usage)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">线程数：</span> 未知
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">句柄数：</span> 未知
                  </p>
                </div>
              </div>
              
              <div className="mt-3">
                <h5 className="text-sm font-medium mb-1">文件信息</h5>
                {process.exe_path ? (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">可执行文件：</span>
                    <span className="text-xs font-mono bg-gray-100 p-1 rounded block mt-1">
                      {process.exe_path}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">无法获取可执行文件路径</p>
                )}
              </div>
              
              <div className="mt-3">
                <h5 className="text-sm font-medium mb-1">命令行</h5>
                <p className="text-sm text-gray-600">
                  <span className="text-xs font-mono bg-gray-100 p-1 rounded block">
                    {process.cmd.join(' ')}
                  </span>
                </p>
              </div>
              
              <div className="mt-3 flex justify-end">
                <button 
                  className="btn btn-secondary text-sm"
                  onClick={() => setShowDetails(false)}
                >
                  关闭详情
                </button>
              </div>
            </div>
          )}
          
          {confirmKill && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      警告：终止系统进程可能导致系统不稳定！
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <button 
                        className="btn btn-danger text-sm py-1"
                        onClick={handleConfirmKill}
                      >
                        确认终止
                      </button>
                      <button 
                        className="btn btn-secondary text-sm py-1"
                        onClick={() => setConfirmKill(false)}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
          onClick={handleKillClick}
          disabled={confirmKill}
        >
          终止进程
        </button>
        
        <button 
          className={`btn ${showDetails ? 'btn-primary' : 'btn-secondary'}`}
          onClick={toggleDetails}
        >
          {showDetails ? '隐藏详情' : '查看详情'}
        </button>
        

      </div>
    </div>
  );
};

export default ProcessCard;
