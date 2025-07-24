import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import SystemDashboard from './components/Dashboard/SystemDashboard';
import PortMonitor from './components/PortMonitor/PortMonitor';
import FileMonitor from './components/FileMonitor/FileMonitor';
import DockerMonitor from './components/Docker/DockerMonitor';
import ProcessManager from './components/ProcessManager/ProcessManager';
import QuickActionsPanel from './components/Common/QuickActionsPanel';
import ShortcutHelp from './components/Common/ShortcutHelp';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { useKeyboardShortcuts, ShortcutConfig } from './utils/keyboardShortcuts';
import { PortInfo } from './types/port';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ports' | 'files' | 'processes' | 'docker' | 'quickactions'>('dashboard');
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showShortcutHelp, setShowShortcutHelp] = useState<boolean>(false);

  useEffect(() => {
    fetchPorts();
  }, []);

  const fetchPorts = async () => {
    try {
      setLoading(true);
      const portsData = await invoke<PortInfo[]>('get_all_ports');
      setPorts(portsData);
      setError(null);
    } catch (err) {
      console.error('获取端口信息失败:', err);
      setError('获取端口信息失败，请检查权限或重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 定义快捷键处理函数
  const handleRefresh = useCallback(() => {
    if (activeTab === 'ports') {
      fetchPorts();
    }
    // 其他标签页的刷新逻辑可以在这里添加
  }, [activeTab]);
  
  const handleTabChange = useCallback((tab: 'dashboard' | 'ports' | 'files' | 'processes' | 'docker' | 'quickactions') => {
    setActiveTab(tab);
  }, []);
  
  const toggleShortcutHelp = useCallback(() => {
    setShowShortcutHelp(prev => !prev);
  }, []);
  
  // 配置快捷键
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'F5',
      action: handleRefresh,
      description: '刷新当前视图'
    },
    {
      key: '0',
      altKey: true,
      action: () => handleTabChange('dashboard'),
      description: '切换到系统仪表盘'
    },
    {
      key: '1',
      altKey: true,
      action: () => handleTabChange('ports'),
      description: '切换到端口监控'
    },
    {
      key: '2',
      altKey: true,
      action: () => handleTabChange('files'),
      description: '切换到文件占用'
    },
    {
      key: '3',
      altKey: true,
      action: () => handleTabChange('processes'),
      description: '切换到进程管理'
    },
    {
      key: '4',
      altKey: true,
      action: () => handleTabChange('docker'),
      description: '切换到Docker容器'
    },
    {
      key: '5',
      altKey: true,
      action: () => handleTabChange('quickactions'),
      description: '切换到快捷操作'
    },
    {
      key: 'h',
      ctrlKey: true,
      action: toggleShortcutHelp,
      description: '显示快捷键帮助'
    }
  ];
  
  // 注册快捷键
  useKeyboardShortcuts(shortcuts);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SystemDashboard />;
      case 'ports':
        return <PortMonitor ports={ports} loading={loading} error={error} onRefresh={fetchPorts} />;
      case 'files':
        return <FileMonitor />;
      case 'processes':
        return <ProcessManager />;
      case 'docker':
        return <DockerMonitor />;
      case 'quickactions':
        return <QuickActionsPanel />;
      default:
        return <SystemDashboard />;
    }
  };

  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="app-container">
          <Header />
          <div className="main-content">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="content">
              {renderContent()}
            </main>
          </div>
          {showShortcutHelp && (
            <ShortcutHelp 
              onClose={() => setShowShortcutHelp(false)}
              shortcuts={shortcuts}
            />
          )}
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;