import React, { useState } from 'react';
import SystemStatusDialog from './SystemStatus';
import SettingsDialog from './Settings';
import TestRunner from './TestRunner';
import About from './About';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header shadow-sm p-4 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-xl font-semibold mr-2"></span>
        <h1 className="text-xl font-semibold">系统监控助手</h1>
      </div>
      <div className="flex gap-4">
        <button 
          className="text-gray-600 hover:text-gray-900"
          onClick={() => setShowSettings(true)}
        >
           设置
        </button>
        <button 
          className="text-gray-600 hover:text-gray-900"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
          title={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button 
          className="text-gray-600 hover:text-gray-900"
          onClick={() => setShowSystemStatus(true)}
        >
           系统状态
        </button>
        <button 
          className="text-gray-600 hover:text-gray-900"
          onClick={() => setShowTestRunner(true)}
        >
           测试
        </button>
        <button 
          className="text-gray-600 hover:text-gray-900"
          onClick={() => setShowAbout(true)}
        >
          ℹ 关于
        </button>
      </div>

      {showSystemStatus && (
        <SystemStatusDialog onClose={() => setShowSystemStatus(false)} />
      )}
      
      {showSettings && (
        <SettingsDialog onClose={() => setShowSettings(false)} />
      )}
      
      {showTestRunner && (
        <TestRunner onClose={() => setShowTestRunner(false)} />
      )}

      {showAbout && (
        <About onClose={() => setShowAbout(false)} />
      )}
    </header>
  );
};

export default Header;
