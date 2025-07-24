import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { PortInfo } from '../../types/port';

interface PortListViewProps {
  ports: PortInfo[];
}

const PortListView: React.FC<PortListViewProps> = ({ ports }) => {
  const [killingPorts, setKillingPorts] = useState<Set<number>>(new Set());

  const handleKillProcess = async (port: PortInfo) => {
    try {
      setKillingPorts(prev => new Set(prev).add(port.process.pid));
      
      const success = await invoke<boolean>('kill_process', { pid: port.process.pid });
      
      if (success) {
        console.log('进程已终止');
      } else {
        console.error('无法终止进程，可能需要管理员权限');
      }
    } catch (err) {
      console.error('终止进程失败:', err);
    } finally {
      setKillingPorts(prev => {
        const newSet = new Set(prev);
        newSet.delete(port.process.pid);
        return newSet;
      });
    }
  };

  const handleOpenBrowser = (port: number) => {
    window.open(`http://localhost:${port}`, '_blank');
  };

  const handleMoreOptions = (port: PortInfo) => {
    // 显示更多选项的模态框或下拉菜单
    console.log('显示更多选项:', port);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'listening':
        return 'text-green-600';
      case 'established':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProjectTypeIcon = (projectType?: string) => {
    switch (projectType) {
      case 'React':
        return '⚛️';
      case 'Vue':
        return '💚';
      case 'Node.js':
        return '🟢';
      case 'Docker':
        return '🐳';
      case 'Database':
        return '🗄️';
      default:
        return '⚙️';
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                端口
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                进程
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                PID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                协议
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                项目
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {ports.map((port) => (
              <tr key={`${port.protocol}-${port.port}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {port.port}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <div className="flex items-center">
                    <span className="mr-2">{getProjectTypeIcon(port.project?.project_type)}</span>
                    <span className="truncate max-w-32" title={port.process.name}>
                      {port.process.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {port.process.pid}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {port.protocol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(port.status)}`}>
                    <span className={`w-2 h-2 rounded-full mr-1 ${
                      port.status.toLowerCase() === 'listening' ? 'bg-green-400' : 'bg-blue-400'
                    }`}></span>
                    {port.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {port.project ? (
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {port.project.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {port.project.project_type}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">系统进程</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleKillProcess(port)}
                      disabled={killingPorts.has(port.process.pid)}
                      title="停止进程"
                    >
                      {killingPorts.has(port.process.pid) ? '⏳' : '🛑'}
                    </button>
                    
                    {port.project && (
                      <button
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => handleOpenBrowser(port.port)}
                        title="在浏览器中打开"
                      >
                        🌐
                      </button>
                    )}
                    
                    <button
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      onClick={() => handleMoreOptions(port)}
                      title="更多选项"
                    >
                      ⋯
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortListView;