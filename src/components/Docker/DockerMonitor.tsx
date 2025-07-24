import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { DockerContainer } from '../../types/docker';
import DockerContainerCard from './DockerContainerCard';
import LoadingSpinner from '../Common/LoadingSpinner';

const DockerMonitor: React.FC = () => {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDockerAvailable, setIsDockerAvailable] = useState<boolean>(true);

  useEffect(() => {
    checkDockerAvailability();
  }, []);

  const checkDockerAvailability = async () => {
    try {
      const available = await invoke<boolean>('is_docker_available');
      setIsDockerAvailable(available);
      
      if (available) {
        fetchContainers();
      } else {
        setLoading(false);
        setError('Docker未安装或无法访问，请确保Docker服务正在运行');
      }
    } catch (err) {
      console.error('检查Docker可用性失败:', err);
      setIsDockerAvailable(false);
      setLoading(false);
      setError('检查Docker可用性失败');
    }
  };

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const containersData = await invoke<DockerContainer[]>('get_docker_containers');
      setContainers(containersData);
      setError(null);
    } catch (err) {
      console.error('获取Docker容器信息失败:', err);
      setError('获取Docker容器信息失败: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopContainer = async (containerId: string) => {
    try {
      await invoke('stop_container', { containerId });
      // 重新获取容器列表
      fetchContainers();
    } catch (err) {
      console.error('停止容器失败:', err);
      setError('停止容器失败: ' + err);
    }
  };

  const handleRestartContainer = async (containerId: string) => {
    try {
      await invoke('restart_container', { containerId });
      // 重新获取容器列表
      fetchContainers();
    } catch (err) {
      console.error('重启容器失败:', err);
      setError('重启容器失败: ' + err);
    }
  };

  if (!isDockerAvailable) {
    return (
      <div className="content-container">
        <h2 className="text-2xl font-bold mb-4">🐳 Docker容器</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Docker未安装或无法访问，请确保Docker服务正在运行。
              </p>
              <p className="mt-2 text-sm">
                <button 
                  className="btn btn-primary text-sm"
                  onClick={checkDockerAvailability}
                >
                  重试连接
                </button>
              </p>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <h3 className="text-lg font-medium mb-4">Docker功能需要安装Docker</h3>
          
          <p className="text-gray-600 mb-4">
            要使用Docker容器监控功能，请确保：
          </p>
          
          <ul className="space-y-2 text-gray-600 list-disc pl-5 mb-4">
            <li>已安装Docker Desktop或Docker Engine</li>
            <li>Docker服务正在运行</li>
            <li>当前用户有权限访问Docker</li>
          </ul>
          
          <p className="text-gray-600">
            安装Docker后，点击上方"重试连接"按钮。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <h2 className="text-2xl font-bold mb-4">🐳 Docker容器</h2>
      
      {error && (
        <div className="error-message mb-4">
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-2"
            onClick={fetchContainers}
          >
            重试
          </button>
        </div>
      )}
      
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">容器列表</h3>
        <button 
          className="btn btn-primary"
          onClick={fetchContainers}
          disabled={loading}
        >
          🔄 刷新
        </button>
      </div>
      
      {loading ? (
        <LoadingSpinner message="正在获取Docker容器信息..." />
      ) : containers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {containers.map((container) => (
            <DockerContainerCard 
              key={container.id} 
              container={container} 
              onStop={handleStopContainer}
              onRestart={handleRestartContainer}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          没有找到正在运行的Docker容器
        </div>
      )}
    </div>
  );
};

export default DockerMonitor;