import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useTheme } from '../../context/ThemeContext';

const QuickActions: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState<string | null>(null);

  const handleAction = async (actionKey: string, action: () => Promise<void>) => {
    try {
      setLoading(prev => ({ ...prev, [actionKey]: true }));
      setMessage(null);
      await action();
      setMessage('操作完成');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(`执行操作失败 (${actionKey}):`, err);
      setMessage(`操作失败: ${err}`);
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const openSystemSettings = async () => {
    try {
      await invoke('open_system_settings');
    } catch (err) {
      // 如果后端API不可用，尝试使用浏览器打开
      window.open('ms-settings:', '_blank');
    }
  };

  const openNetworkSettings = async () => {
    try {
      await invoke('open_network_settings');
    } catch (err) {
      // 如果后端API不可用，尝试使用浏览器打开
      window.open('ms-settings:network', '_blank');
    }
  };

  const openTaskManager = async () => {
    try {
      await invoke('open_task_manager');
    } catch (err) {
      throw new Error('任务管理器功能需要后端支持，请使用 Ctrl+Shift+Esc 快捷键');
    }
  };

  const openDeviceManager = async () => {
    try {
      await invoke('open_device_manager');
    } catch (err) {
      throw new Error('设备管理器功能需要后端支持');
    }
  };

  const openDiskCleanup = async () => {
    try {
      await invoke('open_disk_cleanup');
    } catch (err) {
      throw new Error('磁盘清理功能需要后端支持');
    }
  };

  const openSystemInfo = async () => {
    try {
      await invoke('open_system_info');
    } catch (err) {
      // 如果后端API不可用，尝试使用浏览器打开
      window.open('ms-settings:about', '_blank');
    }
  };

  const restartExplorer = async () => {
    try {
      await invoke('restart_explorer');
    } catch (err) {
      throw new Error('重启资源管理器功能需要后端支持和管理员权限');
    }
  };

  const flushDns = async () => {
    try {
      await invoke('flush_dns');
    } catch (err) {
      throw new Error('刷新DNS缓存功能需要后端支持和管理员权限');
    }
  };

  const actions = [
    {
      key: 'theme',
      icon: theme === 'dark' ? '🌞' : '🌙',
      title: theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式',
      description: '切换应用主题',
      action: async () => toggleTheme(),
      category: 'appearance'
    },
    {
      key: 'system_settings',
      icon: '⚙️',
      title: '系统设置',
      description: '打开Windows系统设置',
      action: openSystemSettings,
      category: 'system'
    },
    {
      key: 'network_settings',
      icon: '🌐',
      title: '网络设置',
      description: '打开网络和Internet设置',
      action: openNetworkSettings,
      category: 'network'
    },
    {
      key: 'task_manager',
      icon: '📊',
      title: '任务管理器',
      description: '打开Windows任务管理器',
      action: openTaskManager,
      category: 'system'
    },
    {
      key: 'device_manager',
      icon: '🔧',
      title: '设备管理器',
      description: '管理系统硬件设备',
      action: openDeviceManager,
      category: 'system'
    },
    {
      key: 'disk_cleanup',
      icon: '🧹',
      title: '磁盘清理',
      description: '清理系统垃圾文件',
      action: openDiskCleanup,
      category: 'maintenance'
    },
    {
      key: 'system_info',
      icon: '📋',
      title: '系统信息',
      description: '查看详细系统信息',
      action: openSystemInfo,
      category: 'system'
    },
    {
      key: 'restart_explorer',
      icon: '🔄',
      title: '重启资源管理器',
      description: '重启Windows资源管理器',
      action: restartExplorer,
      category: 'maintenance'
    },
    {
      key: 'flush_dns',
      icon: '🔄',
      title: '刷新DNS缓存',
      description: '清除DNS解析缓存',
      action: flushDns,
      category: 'network'
    }
  ];

  const categories = {
    appearance: { name: '外观设置', icon: '🎨' },
    system: { name: '系统工具', icon: '⚙️' },
    network: { name: '网络工具', icon: '🌐' },
    maintenance: { name: '系统维护', icon: '🛠️' }
  };

  const groupedActions = actions.reduce((groups, action) => {
    const category = action.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(action);
    return groups;
  }, {} as { [key: string]: typeof actions });

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        🚀 快捷操作
      </h3>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('失败') 
            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' 
            : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
          const categoryActions = groupedActions[categoryKey] || [];
          if (categoryActions.length === 0) return null;

          return (
            <div key={categoryKey}>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <span className="mr-2">{categoryInfo.icon}</span>
                {categoryInfo.name}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryActions.map((action) => (
                  <button
                    key={action.key}
                    className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-3 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleAction(action.key, action.action)}
                    disabled={loading[action.key]}
                  >
                    <div className="flex items-start">
                      <span className="text-lg mr-3 flex-shrink-0">{action.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {loading[action.key] ? '执行中...' : action.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                      {loading[action.key] && (
                        <div className="flex-shrink-0 ml-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 提示：某些操作可能需要管理员权限才能执行
        </p>
      </div>
    </div>
  );
};

export default QuickActions;