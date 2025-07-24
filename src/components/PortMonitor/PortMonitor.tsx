import React, { useState } from 'react';
import { PortInfo, PortFilterOptions } from '../../types/port';
import PortCard from './PortCard';
import PortListView from './PortListView';
import PortOverview from './PortOverview';
import LoadingSpinner from '../Common/LoadingSpinner';
import PortSearch from './PortSearch';

interface PortMonitorProps {
  ports: PortInfo[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

type ViewMode = 'card' | 'list';

const PortMonitor: React.FC<PortMonitorProps> = ({ ports, loading, error, onRefresh }) => {
  const [filterOptions, setFilterOptions] = useState<PortFilterOptions>({
    search: '',
    type: 'all',
    status: 'all',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const filteredPorts = ports.filter((port) => {
    // 搜索过滤
    if (
      filterOptions.search &&
      !port.port.toString().includes(filterOptions.search) &&
      !port.process.name.toLowerCase().includes(filterOptions.search.toLowerCase()) &&
      !(port.project?.name.toLowerCase().includes(filterOptions.search.toLowerCase()) ?? false)
    ) {
      return false;
    }

    // 类型过滤
    if (filterOptions.type !== 'all') {
      if (filterOptions.type === 'development') {
        if (
          !port.project ||
          !['React', 'Vue', 'Node.js'].includes(port.project.project_type)
        ) {
          return false;
        }
      } else if (filterOptions.type === 'docker') {
        if (!port.project || port.project.project_type !== 'Docker') {
          return false;
        }
      } else if (filterOptions.type === 'system') {
        if (port.project) {
          return false;
        }
      }
    }

    // 状态过滤
    if (filterOptions.status !== 'all' && port.status.toLowerCase() !== filterOptions.status) {
      return false;
    }

    return true;
  });

  // 计算端口类型统计
  const portStats = {
    development: ports.filter(
      (p) => p.project && ['React', 'Vue', 'Node.js'].includes(p.project.project_type)
    ).length,
    system: ports.filter((p) => !p.project).length,
    docker: ports.filter((p) => p.project && p.project.project_type === 'Docker').length,
    conflicts: 0, // 这个需要后端提供或者前端计算
  };

  return (
    <div className="content-container">
      <h2 className="text-2xl font-bold mb-4">📊 端口监控</h2>
      
      {error && (
        <div className="error-message mb-4">
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-2"
            onClick={onRefresh}
          >
            重试
          </button>
        </div>
      )}

      <PortOverview stats={portStats} />
      
      <PortSearch 
        filterOptions={filterOptions} 
        onFilterChange={setFilterOptions} 
        onRefresh={onRefresh}
      />

      {/* 视图切换按钮 */}
      <div className="mb-4 flex justify-end">
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

      {loading ? (
        <LoadingSpinner message="正在获取端口信息..." />
      ) : filteredPorts.length > 0 ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredPorts.map((port) => (
              <PortCard key={`${port.protocol}-${port.port}`} port={port} />
            ))}
          </div>
        ) : (
          <PortListView ports={filteredPorts} />
        )
      ) : (
        <div className="text-center py-8 text-gray-500">
          没有找到匹配的端口
        </div>
      )}
    </div>
  );
};

export default PortMonitor;