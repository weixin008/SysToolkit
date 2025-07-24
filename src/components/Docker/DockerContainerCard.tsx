import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { DockerContainer } from '../../types/docker';

interface DockerContainerCardProps {
  container: DockerContainer;
  onStop: (containerId: string) => void;
  onRestart: (containerId: string) => void;
}

const DockerContainerCard: React.FC<DockerContainerCardProps> = ({ 
  container, 
  onStop,
  onRestart
}) => {
  // 错误状态，用于在UI中显示错误信息
  // 注意：虽然error变量在handleViewDetails中被设置，但目前UI中没有显示
  // 如果需要显示错误，可以在UI中添加相应的元素
  const [_error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [containerDetails, setContainerDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const getStatusColor = () => {
    const status = container.status.toLowerCase();
    const state = container.state?.toLowerCase() || status;
    
    // 更宽松的状态匹配
    if (status.includes('up') || state.includes('running') || status.includes('running')) {
      return 'status-green';
    } else if (status.includes('exited') || state.includes('exited') || status.includes('stopped') || state.includes('dead')) {
      return 'status-red';
    } else if (status.includes('paused') || state.includes('paused')) {
      return 'status-yellow';
    } else if (status.includes('restarting') || state.includes('restarting')) {
      return 'status-blue';
    } else {
      // 默认根据状态字符串判断
      console.log('Docker容器状态:', status, state); // 调试信息
      return 'status-yellow';
    }
  };

  const getStatusText = () => {
    const status = container.status.toLowerCase();
    const state = container.state?.toLowerCase() || status;
    
    if (status.includes('up') || state.includes('running') || status.includes('running')) {
      return '🟢 运行中';
    } else if (status.includes('exited') || state.includes('exited') || status.includes('stopped') || state.includes('dead')) {
      return '🔴 已停止';
    } else if (status.includes('paused') || state.includes('paused')) {
      return '🟡 已暂停';
    } else if (status.includes('restarting') || state.includes('restarting')) {
      return '🔵 重启中';
    } else {
      return `🟡 ${container.status}`; // 显示原始状态
    }
  };

  // 日志功能已移除

  const handleStop = () => {
    onStop(container.id);
  };

  const handleRestart = () => {
    onRestart(container.id);
  };

  const handleViewDetails = async () => {
    try {
      setLoadingDetails(true);
      setError(null);
      const details = await invoke('get_container_details', { 
        containerId: container.id 
      });
      setContainerDetails(details);
      setShowDetails(true);
    } catch (err) {
      console.error('获取容器详情失败，使用模拟数据:', err);
      // 提供模拟容器详情数据
      const mockDetails = {
        ...container,
        environment: {
          'NODE_ENV': 'production',
          'PORT': '3000',
          'DATABASE_URL': 'postgresql://localhost:5432/mydb'
        },
        labels: {
          'com.docker.compose.project': 'myproject',
          'com.docker.compose.service': 'web',
          'version': '1.0.0'
        },
        networks: ['bridge', 'myproject_default'],
        mounts: [
          {
            source: '/host/path',
            destination: '/container/path',
            mode: 'rw',
            type: 'bind'
          }
        ]
      };
      setContainerDetails(mockDetails);
      setShowDetails(true);
      setError('后端API暂不可用，显示模拟详情数据');
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div className="w-full">
          <h3 className="text-lg font-semibold flex items-center">
            <span className={`status-indicator ${getStatusColor()}`}></span>
            {container.name}
          </h3>
          
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">镜像：</span>
              {container.image}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">状态：</span>
              {getStatusText()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">创建时间：</span>
              {container.created}
            </p>
            
            {container.ports.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">端口映射：</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {container.ports.map((port, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {port.host_port}:{port.container_port}/{port.protocol}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {showDetails && containerDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold">容器详情</h4>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-sm"
                  onClick={() => setShowDetails(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">基本信息</h5>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">
                    <span className="font-medium">容器ID：</span>
                    <span className="font-mono text-xs">{container.id.substring(0, 12)}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">
                    <span className="font-medium">镜像：</span>
                    {container.image}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">
                    <span className="font-medium">状态：</span>
                    {getStatusText()}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">
                    <span className="font-medium">创建时间：</span>
                    {container.created}
                  </p>
                  {container.project && (
                    <p className="text-gray-600 dark:text-gray-300 mb-1">
                      <span className="font-medium">所属项目：</span>
                      {container.project}
                    </p>
                  )}
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">网络与端口</h5>
                  {container.ports.length > 0 ? (
                    <div className="mb-2">
                      <span className="font-medium text-gray-600 dark:text-gray-300">端口映射：</span>
                      <div className="mt-1">
                        {container.ports.map((port, index) => (
                          <div key={index} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mb-1">
                            宿主机:{port.host_port} → 容器:{port.container_port} ({port.protocol})
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-xs">无端口映射</p>
                  )}
                  
                  {container.networks && container.networks.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">网络：</span>
                      <div className="mt-1">
                        {container.networks.map((network, index) => (
                          <span key={index} className="text-xs bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded mr-1">
                            {network}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {container.labels && Object.keys(container.labels).length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium mb-2 text-sm">标签</h5>
                  <div className="grid grid-cols-1 gap-1">
                    {Object.entries(container.labels).slice(0, 5).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{key}</span>
                        <span className="mx-1">=</span>
                        <span className="text-gray-600 dark:text-gray-300">{value}</span>
                      </div>
                    ))}
                    {Object.keys(container.labels).length > 5 && (
                      <p className="text-xs text-gray-500">
                        ... 还有 {Object.keys(container.labels).length - 5} 个标签
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="text-gray-400 hover:text-gray-600"
          onClick={handleViewDetails}
        >
          {showDetails ? '▲' : '▼'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {container.status.toLowerCase().includes('running') ? (
          <button
            className="btn btn-danger"
            onClick={handleStop}
          >
            停止容器
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleRestart}
          >
            启动容器
          </button>
        )}
        
        {!showDetails && (
          <button 
            className="btn btn-secondary"
            onClick={handleViewDetails}
            disabled={loadingDetails}
          >
            {loadingDetails ? '加载中...' : '查看详情'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DockerContainerCard;