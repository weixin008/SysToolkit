import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { DetailedProcessInfo } from '../../types/process';
import ProcessCard from './ProcessCard';
import ProcessListView from './ProcessListView';
import LoadingSpinner from '../Common/LoadingSpinner';

type ViewMode = 'card' | 'list';

const ProcessManager: React.FC = () => {
  const [processes, setProcesses] = useState<DetailedProcessInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'name'>('cpu');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      // 这个API还没有实现，我们需要在后端添加它
      const processesData = await invoke<DetailedProcessInfo[]>('get_all_processes');
      setProcesses(processesData);
      setError(null);
    } catch (err) {
      console.error('获取进程信息失败:', err);
      setError('获取进程信息失败，请检查权限或重试');
      // 使用模拟数据进行开发
      setProcesses(getMockProcesses());
    } finally {
      setLoading(false);
    }
  };

  const handleKillProcess = async (pid: number) => {
    try {
      // 首先尝试使用Tauri API终止进程
      try {
        const success = await invoke<boolean>('kill_process', { pid });
        if (success) {
          // 从列表中移除已终止的进程
          setProcesses(processes.filter(p => p.pid !== pid));
          return;
        }
      } catch (e) {
        console.log('Tauri API不可用，尝试使用命令行终止进程');
      }
      
      // 如果Tauri API不可用，尝试使用命令行终止进程
      try {
        // 在Windows上使用taskkill命令
        await invoke<string>('run_command', { 
          command: 'taskkill', 
          args: ['/PID', pid.toString(), '/F'] 
        });
        
        // 成功终止进程后，从列表中移除
        setProcesses(processes.filter(p => p.pid !== pid));
      } catch (cmdErr) {
        throw new Error(`无法终止进程: ${cmdErr}`);
      }
    } catch (err) {
      console.error('终止进程失败:', err);
      setError('终止进程失败: ' + err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (sortKey: 'cpu' | 'memory' | 'name') => {
    if (sortBy === sortKey) {
      // 如果已经按这个键排序，则切换排序方向
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // 否则，设置新的排序键并默认为降序
      setSortBy(sortKey);
      setSortDirection('desc');
    }
  };

  const filteredProcesses = processes.filter(process => 
    process.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProcesses = [...filteredProcesses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'cpu':
        comparison = a.cpu_usage - b.cpu_usage;
        break;
      case 'memory':
        comparison = a.memory_usage - b.memory_usage;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // 计算资源使用统计
  const totalCpuUsage = processes.reduce((sum, p) => sum + p.cpu_usage, 0);
  const totalMemoryUsage = processes.reduce((sum, p) => sum + p.memory_usage, 0);
  const processCount = processes.length;

  return (
    <div className="content-container">
      <h2 className="text-2xl font-bold mb-4">⚙️ 进程管理</h2>
      
      {error && (
        <div className="error-message mb-4">
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-2"
            onClick={fetchProcesses}
          >
            重试
          </button>
        </div>
      )}
      
      <div className="overview-stats mb-6">
        <div className="stat-card">
          <div className="stat-label">进程数量</div>
          <div className="stat-value">{processCount}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">CPU使用率</div>
          <div className="stat-value">{totalCpuUsage.toFixed(1)}%</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">内存使用</div>
          <div className="stat-value">{(totalMemoryUsage / (1024 * 1024)).toFixed(1)} MB</div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              🔍
            </span>
            <input
              type="text"
              className="search-input pl-10 w-full"
              placeholder="搜索进程名称..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button 
            className="btn btn-primary ml-4"
            onClick={fetchProcesses}
          >
            🔄 刷新
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              className={`btn ${sortBy === 'cpu' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSort('cpu')}
            >
              {sortBy === 'cpu' && (sortDirection === 'asc' ? '↑ ' : '↓ ')}
              按CPU排序
            </button>
            
            <button 
              className={`btn ${sortBy === 'memory' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSort('memory')}
            >
              {sortBy === 'memory' && (sortDirection === 'asc' ? '↑ ' : '↓ ')}
              按内存排序
            </button>
            
            <button 
              className={`btn ${sortBy === 'name' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSort('name')}
            >
              {sortBy === 'name' && (sortDirection === 'asc' ? '↑ ' : '↓ ')}
              按名称排序
            </button>
          </div>

          {/* 视图切换按钮 */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}
              onClick={() => setViewMode('card')}
            >
              📋 卡片视图
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}
              onClick={() => setViewMode('list')}
            >
              📊 列表视图
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <LoadingSpinner message="正在获取进程信息..." />
      ) : sortedProcesses.length > 0 ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 gap-4">
            {sortedProcesses.map((process) => (
              <ProcessCard 
                key={process.pid} 
                process={process} 
                onKill={handleKillProcess} 
              />
            ))}
          </div>
        ) : (
          <ProcessListView processes={sortedProcesses} onKill={handleKillProcess} />
        )
      ) : (
        <div className="text-center py-8 text-gray-500">
          没有找到匹配的进程
        </div>
      )}
    </div>
  );
};

// 模拟数据，用于开发阶段
function getMockProcesses(): DetailedProcessInfo[] {
  return [
    {
      pid: 1234,
      name: "chrome.exe",
      exe_path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      cmd: ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"],
      cpu_usage: 5.2,
      memory_usage: 250 * 1024 * 1024, // 250 MB
      status: "Running",
      start_time: Date.now() - 3600000, // 1小时前
    },
    {
      pid: 2345,
      name: "node.exe",
      exe_path: "C:\\Program Files\\nodejs\\node.exe",
      cmd: ["C:\\Program Files\\nodejs\\node.exe", "server.js"],
      cpu_usage: 2.8,
      memory_usage: 120 * 1024 * 1024, // 120 MB
      status: "Running",
      start_time: Date.now() - 7200000, // 2小时前
    },
    {
      pid: 3456,
      name: "explorer.exe",
      exe_path: "C:\\Windows\\explorer.exe",
      cmd: ["C:\\Windows\\explorer.exe"],
      cpu_usage: 1.5,
      memory_usage: 80 * 1024 * 1024, // 80 MB
      status: "Running",
      start_time: Date.now() - 86400000, // 1天前
    },
    {
      pid: 4567,
      name: "svchost.exe",
      exe_path: "C:\\Windows\\System32\\svchost.exe",
      cmd: ["C:\\Windows\\System32\\svchost.exe", "-k", "LocalServiceNetworkRestricted"],
      cpu_usage: 0.8,
      memory_usage: 45 * 1024 * 1024, // 45 MB
      status: "Running",
      start_time: Date.now() - 86400000 * 2, // 2天前
    },
    {
      pid: 5678,
      name: "vscode.exe",
      exe_path: "C:\\Program Files\\Microsoft VS Code\\Code.exe",
      cmd: ["C:\\Program Files\\Microsoft VS Code\\Code.exe"],
      cpu_usage: 4.3,
      memory_usage: 320 * 1024 * 1024, // 320 MB
      status: "Running",
      start_time: Date.now() - 10800000, // 3小时前
    },
  ];
}

export default ProcessManager;