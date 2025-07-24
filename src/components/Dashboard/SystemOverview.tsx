import React from 'react';
import { SystemInfo } from '../../types/system';

interface SystemOverviewProps {
  systemInfo: SystemInfo;
  title?: string;
}

const SystemOverview: React.FC<SystemOverviewProps> = ({ systemInfo, title }) => {
  // 这些函数暂时未使用，但保留以备将来使用
  // const formatUptime = (seconds: number) => {
  //   // Make sure seconds is a valid number
  //   if (typeof seconds !== 'number' || isNaN(seconds)) {
  //     console.warn('Invalid uptime value:', seconds);
  //     seconds = 0;
  //   }
  //   
  //   const days = Math.floor(seconds / 86400);
  //   const hours = Math.floor((seconds % 86400) / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   
  //   if (days > 0) {
  //     return `${days}天 ${hours}小时 ${minutes}分钟`;
  //   } else if (hours > 0) {
  //     return `${hours}小时 ${minutes}分钟`;
  //   } else {
  //     return `${minutes}分钟`;
  //   }
  // };
  // 
  // const formatBootTime = (timestamp: number) => {
  //   const date = new Date(timestamp * 1000);
  //   return date.toLocaleString();
  // };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        🖥️ {title || '系统概览'}
      </h3>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">操作系统</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={systemInfo.os.name}>
              {systemInfo.os.name ? systemInfo.os.name.replace('Microsoft ', '') : '未知'}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">版本</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {systemInfo.os.version || '未知'}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">内核</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
              {systemInfo.os.kernel_version || '未知'}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">架构</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {systemInfo.os.architecture || '未知'}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">主机名</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={systemInfo.os.hostname}>
              {systemInfo.os.hostname || '未知'}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">CPU核心</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {systemInfo.hardware.cpu.cores || 0} 核心
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;