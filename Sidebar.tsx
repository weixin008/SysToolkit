import React, { useState } from 'react';
// 导入图片
import gzhQRCode from './gzh.png';

interface SidebarProps {
  activeTab: 'dashboard' | 'ports' | 'files' | 'processes' | 'docker' | 'quickactions';
  onTabChange: (tab: 'dashboard' | 'ports' | 'files' | 'processes' | 'docker' | 'quickactions') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [showQRCode, setShowQRCode] = useState(false);
  
  const tabs = [
    { id: 'dashboard' as const, name: '系统仪表盘', icon: '📊' },
    { id: 'ports' as const, name: '端口监控', icon: '🔌' },
    { id: 'files' as const, name: '文件占用', icon: '📁' },
    { id: 'processes' as const, name: '进程管理', icon: '⚙️' },
    { id: 'docker' as const, name: 'Docker容器', icon: '🐳' },
    { id: 'quickactions' as const, name: '快捷操作', icon: '🚀' },
  ];

  return (
    <aside className="sidebar w-48 border-r border-gray-200 flex flex-col h-full">
      <nav className="p-4 flex-grow">
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                  activeTab === tab.id
                    ? 'active-tab'
                    : 'inactive-tab'
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* 微信公众号信息 */}
      <div className="border-t border-gray-200 p-3 relative">
        <div 
          className="flex items-center justify-center cursor-pointer"
          onMouseEnter={() => setShowQRCode(true)}
          onMouseLeave={() => setShowQRCode(false)}
        >
          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <span className="mr-2">👨‍💻</span>
            开发者豆子
          </span>
        </div>
        
        {showQRCode && (
          <div className="absolute bottom-16 left-0 right-0 mx-auto bg-white dark:bg-gray-800 p-2 rounded-md shadow-lg flex flex-col items-center z-10 border border-gray-200 dark:border-gray-700">
            <img src={gzhQRCode} alt="微信公众号" className="w-32 h-32 mb-1" />
            <p className="text-xs text-gray-600 dark:text-gray-400">扫码关注公众号</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">GitHub：weixin008</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;