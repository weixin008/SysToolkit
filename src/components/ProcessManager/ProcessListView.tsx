import React, { useState } from 'react';
import { DetailedProcessInfo } from '../../types/process';

interface ProcessListViewProps {
  processes: DetailedProcessInfo[];
  onKill: (pid: number) => void;
}

const ProcessListView: React.FC<ProcessListViewProps> = ({ processes, onKill }) => {
  const [killingProcesses, setKillingProcesses] = useState<Set<number>>(new Set());

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatTime = (timestamp: number) => {
    const adjustedTimestamp = timestamp < 946684800000 ? timestamp * 1000 : timestamp;
    const date = new Date(adjustedTimestamp);
    return date.toLocaleString();
  };

  const getProcessIcon = (processName: string) => {
    switch (processName.toLowerCase()) {
      case 'chrome.exe':
        return '🌐';
      case 'node.exe':
        return '🟢';
      case 'explorer.exe':
        return '📁';
      case 'svchost.exe':
        return '⚙️';
      case 'vscode.exe':
        return '💻';
      default:
        return '📋';
    }
  };

  const handleKillProcess = async (pid: number) => {
    try {
      setKillingProcesses(prev => new Set(prev).add(pid));
      await onKill(pid);
    } finally {
      setKillingProcesses(prev => {
        const newSet = new Set(prev);
        newSet.delete(pid);
        return newSet;
      });
    }
  };

  // 暂未实现的Chrome标签页查看功能
  // const handleViewChromeDetails = (process: DetailedProcessInfo) => {
  //   console.log('查看Chrome标签页:', process);
  //   // 可以调用后端API获取Chrome标签页信息
  // };

  const getCpuUsageColor = (usage: number) => {
    if (usage > 10) return 'text-red-600 font-semibold';
    if (usage > 5) return 'text-yellow-600 font-medium';
    return 'text-green-600';
  };

  const getMemoryUsageColor = (usage: number) => {
    const mb = usage / (1024 * 1024);
    if (mb > 500) return 'text-red-600 font-semibold';
    if (mb > 200) return 'text-yellow-600 font-medium';
    return 'text-green-600';
  };

  const isSystemProcess = (processName: string) => {
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
    return systemProcesses.includes(processName.toLowerCase());
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                进程
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                PID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                CPU使用率
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                内存使用
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                启动时间
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {processes.map((process) => (
              <tr key={process.pid} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-3 text-lg">{getProcessIcon(process.name)}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {process.name}
                      </div>
                      {process.exe_path && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-48" title={process.exe_path}>
                          {process.exe_path}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {process.pid}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getCpuUsageColor(process.cpu_usage)}>
                    {process.cpu_usage.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getMemoryUsageColor(process.memory_usage)}>
                    {formatMemory(process.memory_usage)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    {process.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatTime(process.start_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">

                    
                    <button
                      className={`${
                        isSystemProcess(process.name)
                          ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                          : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                      }`}
                      onClick={() => handleKillProcess(process.pid)}
                      disabled={killingProcesses.has(process.pid)}
                      title={isSystemProcess(process.name) ? "系统进程 - 谨慎终止" : "终止进程"}
                    >
                      {killingProcesses.has(process.pid) ? '⏳' : '🛑'}
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

export default ProcessListView;