import React from 'react';
import { PortFilterOptions } from '../../types/port';

interface PortSearchProps {
  filterOptions: PortFilterOptions;
  onFilterChange: (options: PortFilterOptions) => void;
  onRefresh: () => void;
}

const PortSearch: React.FC<PortSearchProps> = ({ 
  filterOptions, 
  onFilterChange,
  onRefresh
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filterOptions,
      search: e.target.value
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filterOptions,
      type: e.target.value as any
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filterOptions,
      status: e.target.value as any
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            🔍
          </span>
          <input
            type="text"
            className="search-input pl-10 w-full"
            placeholder="搜索端口、进程或项目..."
            value={filterOptions.search}
            onChange={handleSearchChange}
          />
        </div>
        <button 
          className="btn btn-primary ml-4"
          onClick={onRefresh}
        >
          🔄 刷新
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            端口类型
          </label>
          <select
            className="w-full"
            value={filterOptions.type}
            onChange={handleTypeChange}
          >
            <option value="all">全部类型</option>
            <option value="development">开发端口</option>
            <option value="system">系统端口</option>
            <option value="docker">Docker端口</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            端口状态
          </label>
          <select
            className="w-full"
            value={filterOptions.status}
            onChange={handleStatusChange}
          >
            <option value="all">全部状态</option>
            <option value="listening">监听中</option>
            <option value="established">已建立连接</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PortSearch;