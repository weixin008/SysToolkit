
import React from 'react';
import { HardwareInfo } from '../../types/system';

interface HardwareMonitorProps {
  hardware?: HardwareInfo;
}

const HardwareMonitor: React.FC<HardwareMonitorProps> = ({ hardware }) => {
  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatFrequency = (hz: number) => {
    if (!hz) return '0 GHz';
    const ghz = hz / 1000000000;
    return `${ghz.toFixed(2)} GHz`;
  };

  const getUsageColor = (usage?: number) => {
    if (usage && usage > 80) return 'bg-red-500';
    if (usage && usage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageTextColor = (usage?: number) => {
    if (usage && usage > 80) return 'text-red-600';
    if (usage && usage > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!hardware) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          🔧 硬件监控
        </h3>
        <p>数据加载中...</p>
      </div>
    );
  }

  const cpuUsage = hardware.cpu?.usage ?? 0;
  const memUsage = hardware.memory?.usage_percent ?? 0;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        🔧 硬件监控
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* CPU 信息 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center text-gray-900 dark:text-gray-100">
              🖥️ 处理器
            </h4>
            <span className={`text-xs font-semibold ${getUsageTextColor(cpuUsage)}`}>
              {cpuUsage.toFixed(1)}%
            </span>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate" title={hardware.cpu?.brand ?? 'N/A'}>
              {hardware.cpu?.brand ?? '未知品牌'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {hardware.cpu?.cores ?? 'N/A'} 核心 • {formatFrequency(hardware.cpu?.frequency ?? 0)}
            </p>
            {hardware.cpu?.temperature && (
              <p className="text-xs text-gray-600 dark:text-gray-300">
                温度: <span className={hardware.cpu.temperature > 70 ? 'text-red-600' : 'text-green-600'}>
                  {hardware.cpu.temperature.toFixed(1)}°C
                </span>
              </p>
            )}
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getUsageColor(cpuUsage)}`}
              style={{ width: `${cpuUsage}%` }}
            ></div>
          </div>
        </div>

        {/* 内存信息 */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center text-gray-900 dark:text-gray-100">
              🧠 内存
            </h4>
            <span className={`text-xs font-semibold ${getUsageTextColor(memUsage)}`}>
              {memUsage.toFixed(1)}%
            </span>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              总容量: {formatBytes(hardware.memory?.total ?? 0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              已使用: {formatBytes(hardware.memory?.used ?? 0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              可用: {formatBytes(hardware.memory?.available ?? 0)}
            </p>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getUsageColor(memUsage)}`}
              style={{ width: `${memUsage}%` }}
            ></div>
          </div>
        </div>

        {/* GPU 信息 */}
        {(hardware.gpu || []).slice(0, 2).map((gpu, index) => {
          const gpuUsage = gpu.usage ?? 0;
          const memoryUsed = gpu.memory_used ?? 0;
          const memoryTotal = gpu.memory ?? 0;
          const memoryAvailable = memoryTotal - memoryUsed;
          const memoryUsagePercent = memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0;
          
          return (
            <div key={index} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center text-gray-900 dark:text-gray-100">
                  🎮 显卡 {index + 1}
                </h4>
                {gpu.usage !== undefined && (
                  <span className={`text-xs font-semibold ${getUsageTextColor(gpuUsage)}`}>
                    {gpuUsage.toFixed(1)}%
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate" title={gpu.name ?? 'N/A'}>
                  {gpu.name ?? '未知显卡'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {gpu.vendor ?? 'N/A'}
                </p>
                
                {/* 显存信息 */}
                {memoryTotal > 0 && (
                  <>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      总显存: {formatBytes(memoryTotal)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      已使用: {formatBytes(memoryUsed)} ({memoryUsagePercent.toFixed(1)}%)
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      可用: {formatBytes(memoryAvailable)}
                    </p>
                  </>
                )}
                
                {gpu.temperature && (
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    温度: <span className={gpu.temperature > 80 ? 'text-red-600' : 'text-green-600'}>
                      {gpu.temperature.toFixed(1)}°C
                    </span>
                  </p>
                )}
              </div>
              
              {/* GPU使用率进度条 */}
              {gpu.usage !== undefined && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${getUsageColor(gpuUsage)}`}
                    style={{ width: `${gpuUsage}%` }}
                  ></div>
                </div>
              )}
              
              {/* 显存使用率进度条 */}
              {memoryTotal > 0 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${getUsageColor(memoryUsagePercent)}`}
                    style={{ width: `${memoryUsagePercent}%` }}
                  ></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default HardwareMonitor;
