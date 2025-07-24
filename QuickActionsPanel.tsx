import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/shell';
// 导入图片
import zsmQRCode from './zsm.png';

const QuickActionsPanel: React.FC = () => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [result, setResult] = useState<{ command: string, output: string } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), type === 'error' ? 5000 : 3000);
  };

  const handleAction = async (actionKey: string, action: () => Promise<void>) => {
    try {
      setLoading(prev => ({ ...prev, [actionKey]: true }));
      setMessage(null);
      setResult(null);
      await action();
      showMessage('✅ 操作完成', 'success');
    } catch (err) {
      console.error(`执行操作失败 (${actionKey}):`, err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      showMessage(`❌ 操作失败: ${errorMsg}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // 执行命令并显示结果
  const executeCommand = async (command: string, args: string[] = [], displayName: string = command) => {
    try {
      console.log(`执行命令: ${command} ${args.join(' ')}`);
      const result = await invoke<string>('run_command', { command, args });
      setResult({
        command: displayName,
        output: result
      });
      setShowResultModal(true);
      return result;
    } catch (err) {
      console.error(`执行命令失败: ${err}`);
      throw new Error(`执行命令 ${displayName} 失败: ${err}`);
    }
  };

  // 在新窗口中执行命令
  const executeCommandInNewWindow = async (command: string, args: string[] = []) => {
    try {
      console.log(`在新窗口中执行命令: ${command} ${args.join(' ')}`);
      await invoke('run_command_in_new_window', { command, args });
      return "命令已在新窗口中执行";
    } catch (err) {
      console.error(`在新窗口中执行命令失败: ${err}`);
      throw new Error(`在新窗口中执行命令失败: ${err}`);
    }
  };

  // 打开系统应用
  const openSystemApp = async (appCommand: string) => {
    try {
      await invoke(appCommand);
    } catch (err) {
      console.error(`打开系统应用失败: ${err}`);
      throw new Error(`打开系统应用失败: ${err}`);
    }
  };

  // 打开GUI应用（不显示命令窗口）
  const openGuiApp = async (appName: string) => {
    try {
      console.log(`打开GUI应用: ${appName}`);
      await invoke('open_gui_app', { appName });
    } catch (err) {
      console.error(`打开GUI应用失败: ${err}`);
      throw new Error(`打开GUI应用失败: ${err}`);
    }
  };

  // 系统管理工具
  const systemManagementTools = [
    {
      key: 'task_manager',
      icon: '📊',
      title: '任务管理器',
      description: 'Ctrl+Shift+Esc',
      action: async () => {
        await openSystemApp('open_task_manager');
      },
    },
    {
      key: 'device_manager',
      icon: '🔧',
      title: '设备管理器',
      description: '管理硬件设备',
      action: async () => {
        await openSystemApp('open_device_manager');
      },
    },
    {
      key: 'services',
      icon: '🔄',
      title: '服务管理',
      description: '管理系统服务',
      action: async () => {
        await openGuiApp('services.msc');
      },
    },
    {
      key: 'event_viewer',
      icon: '📝',
      title: '事件查看器',
      description: '查看系统日志',
      action: async () => {
        await openGuiApp('eventvwr.msc');
      },
    },
    {
      key: 'system_info',
      icon: '📋',
      title: '系统信息',
      description: '查看系统详情',
      action: async () => {
        await openSystemApp('open_system_info');
      },
    },
    {
      key: 'computer_management',
      icon: '🖥️',
      title: '计算机管理',
      description: '系统管理控制台',
      action: async () => {
        await openGuiApp('compmgmt.msc');
      },
    },
    {
      key: 'local_users_groups',
      icon: '👥',
      title: '本地用户和组',
      description: '管理用户账户',
      action: async () => {
        await openGuiApp('lusrmgr.msc');
      },
    },
    {
      key: 'group_policy',
      icon: '📜',
      title: '组策略编辑器',
      description: '本地组策略',
      action: async () => {
        await openGuiApp('gpedit.msc');
      },
    }
  ];

  // 系统设置工具
  const systemSettingsTools = [
    {
      key: 'system_settings',
      icon: '⚙️',
      title: '系统设置',
      description: 'Windows设置面板',
      action: async () => {
        await openSystemApp('open_system_settings');
      },
    },
    {
      key: 'control_panel',
      icon: '🎛️',
      title: '控制面板',
      description: '传统控制面板',
      action: async () => {
        await openGuiApp('control');
      },
    },
    {
      key: 'power_options',
      icon: '🔋',
      title: '电源选项',
      description: '电源和睡眠设置',
      action: async () => {
        await openGuiApp('powercfg.cpl');
      },
    }
  ];

  // 存储和磁盘工具
  const storageTools = [
    {
      key: 'disk_management',
      icon: '💽',
      title: '磁盘管理',
      description: '管理磁盘分区',
      action: async () => {
        await openGuiApp('diskmgmt.msc');
      },
    },
    {
      key: 'storage_settings',
      icon: '💾',
      title: '存储设置',
      description: '存储空间管理',
      action: async () => {
        await openGuiApp('ms-settings:storagesense');
      },
    },
    {
      key: 'disk_cleanup',
      icon: '🗑️',
      title: '磁盘清理',
      description: '清理系统垃圾文件',
      action: async () => {
        await openGuiApp('cleanmgr');
      },
    },
    {
      key: 'defrag',
      icon: '🧩',
      title: '磁盘碎片整理',
      description: '优化磁盘性能',
      action: async () => {
        await openGuiApp('dfrgui');
      },
    }
  ];

  // 网络和安全工具
  const networkSecurityTools = [
    {
      key: 'network_settings',
      icon: '🌐',
      title: '网络设置',
      description: '网络和Internet设置',
      action: async () => {
        await openSystemApp('open_network_settings');
      },
    },
    {
      key: 'network_connections',
      icon: '🔗',
      title: '网络连接',
      description: '网络适配器设置',
      action: async () => {
        await openGuiApp('ncpa.cpl');
      },
    },
    {
      key: 'firewall',
      icon: '🔥',
      title: '防火墙设置',
      description: '管理Windows防火墙',
      action: async () => {
        await openGuiApp('firewall.cpl');
      },
    },
    {
      key: 'windows_security',
      icon: '🛡️',
      title: 'Windows安全中心',
      description: '病毒防护和安全',
      action: async () => {
        await openSystemApp('open_windows_security');
      },
    }
  ];

  // 开发者和高级工具
  const developerTools = [
    {
      key: 'powershell',
      icon: '💻',
      title: 'PowerShell',
      description: '高级命令行工具',
      action: async () => {
        await executeCommandInNewWindow('powershell');
      },
    },
    {
      key: 'cmd',
      icon: '⌨️',
      title: '命令提示符',
      description: '传统命令行',
      action: async () => {
        await executeCommandInNewWindow('cmd');
      },
    },
    {
      key: 'regedit',
      icon: '🔑',
      title: '注册表编辑器',
      description: '修改系统注册表',
      action: async () => {
        await openGuiApp('regedit');
      },
    },
    {
      key: 'resource_monitor',
      icon: '📈',
      title: '资源监视器',
      description: '详细系统资源监控',
      action: async () => {
        await openGuiApp('resmon');
      },
    },
    {
      key: 'performance_monitor',
      icon: '📊',
      title: '性能监视器',
      description: '系统性能分析',
      action: async () => {
        await openGuiApp('perfmon');
      },
    }
  ];

  // 命令行工具
  const commandTools = [
    {
      key: 'ipconfig',
      icon: '🔍',
      title: 'IP配置',
      description: 'ipconfig /all',
      action: async () => {
        await executeCommand('ipconfig', ['/all'], 'ipconfig /all');
      },
    },
    {
      key: 'netstat',
      icon: '🔗',
      title: '网络连接',
      description: 'netstat -an',
      action: async () => {
        await executeCommand('netstat', ['-an'], 'netstat -an');
      },
    },
    {
      key: 'systeminfo',
      icon: '💻',
      title: '系统详情',
      description: 'systeminfo命令',
      action: async () => {
        await executeCommand('systeminfo');
      },
    }
  ];

  // 网络诊断工具
  const networkTools = [
    {
      key: 'wlan_info',
      icon: '📶',
      title: 'WLAN信息',
      description: 'netsh wlan show profiles',
      action: async () => {
        await executeCommand('netsh', ['wlan', 'show', 'profiles'], 'netsh wlan show profiles');
      },
    },
    {
      key: 'route_print',
      icon: '🗺️',
      title: '路由表',
      description: 'route print',
      action: async () => {
        await executeCommand('route', ['print'], 'route print');
      },
    }
  ];

  // 工具分类
  const categories = [
    { id: 'system_management', name: '系统管理', icon: '⚙️', tools: systemManagementTools },
    { id: 'system_settings', name: '系统设置', icon: '🎛️', tools: systemSettingsTools },
    { id: 'storage', name: '存储磁盘', icon: '�', toolso: storageTools },
    { id: 'network_security', name: '网络安全', icon: '🔒', tools: networkSecurityTools },
    { id: 'developer', name: '开发工具', icon: '👨‍💻', tools: developerTools },
    { id: 'command', name: '命令工具', icon: '💻', tools: commandTools },
    { id: 'network', name: '网络诊断', icon: '🌐', tools: networkTools }
  ];

  return (
    <div className="content-container">
      <h2 className="text-2xl font-bold mb-6">🚀 快捷操作</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm transition-all duration-300 ease-in-out transform ${
          messageType === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
            : messageType === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
            : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
        } animate-fade-in`}>
          {message}
        </div>
      )}

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.id} className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {category.tools.map((tool) => (
                <button
                  key={tool.key}
                  className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-4 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
                  onClick={() => handleAction(tool.key, tool.action)}
                  disabled={loading[tool.key]}
                >
                  <div className="flex items-start">
                    <span className="text-xl mr-3 flex-shrink-0">{tool.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {loading[tool.key] ? '执行中...' : tool.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {tool.description}
                      </p>
                    </div>
                    {loading[tool.key] && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">💡 使用提示</h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• 某些操作可能需要管理员权限才能执行</li>
          <li>• 命令工具会在弹窗中显示结果，可以复制保存</li>
          <li>• 系统工具会直接打开对应的Windows工具</li>
          <li>• 如果工具无法打开，请检查系统版本兼容性</li>
          <li>• 开发工具会在新命令窗口中执行</li>
        </ul>
      </div>

      {/* 赞赏支持区域 */}
      <div className="mt-8 flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">❤️ 赞赏支持</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 text-center">
          如果您觉得这个工具对您有帮助，可以扫描下方二维码支持开发者
        </p>
        <div className="flex flex-col items-center">
          <img src={zsmQRCode} alt="赞赏码" className="w-40 h-40 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">感谢您的支持！</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">开发者豆子 (GitHub: weixin008)</p>
        </div>
      </div>

      {/* 命令结果弹窗 */}
      {showResultModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col modal-fade-in">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                📋 命令执行结果: <span className="font-mono text-blue-600 dark:text-blue-400">{result.command}</span>
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
                onClick={() => setShowResultModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-96 text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-words">
                {result.output || '(无输出)'}
              </pre>
            </div>
            <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                输出长度: {result.output?.length || 0} 字符
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  onClick={() => navigator.clipboard.writeText(result.output)}
                >
                  📋 复制结果
                </button>
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                  onClick={() => setShowResultModal(false)}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionsPanel;