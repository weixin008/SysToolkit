import React, { useState } from 'react';
// 导入图片
import zsmQRCode from '../../assets/zsm.png';

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
          onClick={() => setShowQRCode(!showQRCode)}
        >
          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <span className="mr-2">👨‍💻</span>
            公众号：豆子爱分享
          </span>
        </div>
        
        {showQRCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  关注与支持
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
                  onClick={() => setShowQRCode(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-8">
                <div className="flex flex-col items-center">
                  <img src={zsmQRCode} alt="赞赏码" className="w-63 h-63 mb-3" />
                  <p className="text-base text-gray-700 dark:text-gray-300">感谢您的赞赏支持</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;