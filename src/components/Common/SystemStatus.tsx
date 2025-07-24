import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { SystemStatus } from '../../types/system';
import LoadingSpinner from './LoadingSpinner';

interface SystemStatusProps {
  onClose: () => void;
}

const SystemStatusDialog: React.FC<SystemStatusProps> = ({ onClose }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const status = await invoke<SystemStatus>('get_system_status');
      setSystemStatus(status);
      setError(null);
    } catch (err) {
      console.error('获取系统状态失败:', err);
      setError('获取系统状态失败: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <span className="text-success"></span> : 
      <span className="text-error"></span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="dialog-content rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">系统状态</h2>
            <button 
              className="dialog-close-btn"
              onClick={onClose}
            >
              
            </button>
          </div>
          
          {loading ? (
            <LoadingSpinner message="正在获取系统状态..." />
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={fetchSystemStatus}
              >
                重试
              </button>
            </div>
          ) : systemStatus ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">系统信息</h3>
                <div className="status-panel rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-secondary">操作系统</p>
                      <p className="font-medium">{systemStatus.system_info.os_name} {systemStatus.system_info.os_version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">内核版本</p>
                      <p className="font-medium">{systemStatus.system_info.kernel_version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">主机名</p>
                      <p className="font-medium">{systemStatus.system_info.hostname}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">CPU核心数</p>
                      <p className="font-medium">{systemStatus.system_info.cpu_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">内存使用</p>
                      <p className="font-medium">
                        {formatMemory(systemStatus.system_info.used_memory)} / {formatMemory(systemStatus.system_info.total_memory)}
                      </p>
                      <div className="w-full progress-bg rounded-full h-2 mt-1">
                        <div 
                          className="progress-fill h-2 rounded-full" 
                          style={{ width: `${(systemStatus.system_info.used_memory / systemStatus.system_info.total_memory) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">交换空间</p>
                      <p className="font-medium">
                        {formatMemory(systemStatus.system_info.used_swap)} / {formatMemory(systemStatus.system_info.total_swap)}
                      </p>
                      <div className="w-full progress-bg rounded-full h-2 mt-1">
                        <div 
                          className="progress-fill h-2 rounded-full" 
                          style={{ width: `${(systemStatus.system_info.used_swap / systemStatus.system_info.total_swap) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">API状态</h3>
                <div className="status-panel rounded-lg p-4">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-divider">
                        <td className="py-2 font-medium">端口监控</td>
                        <td className="py-2 text-right">{getStatusIcon(systemStatus.api_status.port_monitor)}</td>
                      </tr>
                      <tr className="border-b border-divider">
                        <td className="py-2 font-medium">进程分析</td>
                        <td className="py-2 text-right">{getStatusIcon(systemStatus.api_status.process_analyzer)}</td>
                      </tr>
                      <tr className="border-b border-divider">
                        <td className="py-2 font-medium">文件占用监控</td>
                        <td className="py-2 text-right">{getStatusIcon(systemStatus.api_status.file_monitor)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Docker集成</td>
                        <td className="py-2 text-right">{getStatusIcon(systemStatus.api_status.docker)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">应用信息</h3>
                <div className="status-panel rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-secondary">版本</p>
                      <p className="font-medium">v{systemStatus.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">构建日期</p>
                      <p className="font-medium">2025年1月19日</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button 
                  className="btn btn-primary"
                  onClick={onClose}
                >
                  关闭
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SystemStatusDialog;
