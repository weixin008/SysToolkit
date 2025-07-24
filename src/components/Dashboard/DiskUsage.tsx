

import React from 'react';
import { DiskInfo } from '../../types/system';

interface DiskUsageProps {
  disks?: DiskInfo[];
}

const DiskUsage: React.FC<DiskUsageProps> = ({ disks = [] }) => {
  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return '0 GB';
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TB`;
  };

  const getUsageColor = (usage?: number) => {
    if (usage && usage > 90) return 'bg-red-500';
    if (usage && usage > 80) return 'bg-yellow-500';
    if (usage && usage > 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getUsageTextColor = (usage?: number) => {
    if (usage && usage > 90) return 'text-red-600';
    if (usage && usage > 80) return 'text-yellow-600';
    if (usage && usage > 60) return 'text-blue-600';
    return 'text-green-600';
  };

  const getDiskIcon = (disk: DiskInfo) => {
    if (disk.is_removable) return '💾';
    if (disk.mount_point === '/' || (disk.mount_point || '').includes('C:')) return '💻';
    return '💿';
  };

  const getDiskTypeText = (disk: DiskInfo) => {
    if (disk.is_removable) return '可移动磁盘';
    if (disk.mount_point === '/' || (disk.mount_point || '').includes('C:')) return '系统磁盘';
    return '本地磁盘';
  };

  const totalSpace = disks.reduce((sum, disk) => sum + (disk.total_space || 0), 0);
  const totalUsed = disks.reduce((sum, disk) => sum + (disk.used_space || 0), 0);
  const totalAvailable = disks.reduce((sum, disk) => sum + (disk.available_space || 0), 0);
  const totalUsagePercent = totalSpace > 0 ? (totalUsed / totalSpace) * 100 : 0;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-gray-100">
        💿 磁盘使用情况
      </h3>
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">总存储空间</h4>
          <span className={`text-sm font-semibold ${getUsageTextColor(totalUsagePercent)}`}>
            {totalUsagePercent.toFixed(1)}%
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center mb-3">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-300">总容量</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatBytes(totalSpace)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-300">已使用</p>
            <p className="text-sm font-semibold text-red-600">
              {formatBytes(totalUsed)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-300">可用</p>
            <p className="text-sm font-semibold text-green-600">
              {formatBytes(totalAvailable)}
            </p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(totalUsagePercent)}`}
            style={{ width: `${totalUsagePercent}%` }}
          ></div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">磁盘详情</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {disks.map((disk, index) => {
            const usagePercent = disk.usage_percent ?? 0;
            return (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  const mountPoint = disk.mount_point || '';
                  if (!mountPoint) return;
                  
                  import('@tauri-apps/api/tauri').then(({ invoke }) => {
                    invoke('open_in_explorer', { path: mountPoint }).catch(err => {
                      console.error(`Failed to open path ${mountPoint}:`, err);
                    });
                  });
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getDiskIcon(disk)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {disk.name || disk.mount_point}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getDiskTypeText(disk)} • {disk.file_system || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${getUsageTextColor(usagePercent)}`}>
                      {usagePercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-2">
                  <span>总容量: <span className="font-medium text-gray-900 dark:text-gray-100">{formatBytes(disk.total_space)}</span></span>
                  <span>可用: <span className="font-medium text-green-600">{formatBytes(disk.available_space)}</span></span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${getUsageColor(usagePercent)}`}
                    style={{ width: `${usagePercent}%` }}
                  ></div>
                </div>
                
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 text-center">
                  点击打开磁盘
                </p>
                
                {usagePercent > 90 && (
                  <div className="mt-1 text-xs text-red-600 dark:text-red-400 text-center">
                    ⚠️ 磁盘空间不足
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default DiskUsage;
