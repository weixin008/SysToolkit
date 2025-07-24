import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';

interface SettingsDialogProps {
  onClose: () => void;
}

interface SettingsState {
  autoRefresh: boolean;
  refreshInterval: number;
  showSystemProcesses: boolean;
  confirmDangerousActions: boolean;
  enableAnimations: boolean;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { showNotification } = useNotification();
  
  // 从本地存储加载设置，或使用默认值
  const [settings, setSettings] = useState<SettingsState>(() => {
    const savedSettings = localStorage.getItem('app-settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      autoRefresh: true,
      refreshInterval: 30,
      showSystemProcesses: true,
      confirmDangerousActions: true,
      enableAnimations: true,
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value === 'true' ? true : value === 'false' ? false : value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
    showNotification('success', '设置已保存', 3000);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="dialog-content rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">设置</h2>
            <button 
              className="dialog-close-btn"
              onClick={onClose}
            >
              
            </button>
          </div>
          
          <div className="space-y-6">
            {/* 外观设置 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">外观</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium">主题</label>
                  <div className="flex items-center">
                    <span className="mr-2">亮色</span>
                    <button 
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${theme === 'dark' ? 'theme-toggle-active' : 'theme-toggle-inactive'}`}
                      onClick={toggleTheme}
                    >
                      <span 
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} 
                      />
                    </button>
                    <span className="ml-2">暗色</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="enableAnimations" className="font-medium">启用动画效果</label>
                  <input
                    type="checkbox"
                    id="enableAnimations"
                    name="enableAnimations"
                    checked={settings.enableAnimations}
                    onChange={handleChange}
                    className="checkbox"
                  />
                </div>
              </div>
            </div>
            
            {/* 数据刷新设置 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">数据刷新</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="autoRefresh" className="font-medium">自动刷新数据</label>
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    name="autoRefresh"
                    checked={settings.autoRefresh}
                    onChange={handleChange}
                    className="checkbox"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="refreshInterval" className="font-medium">刷新间隔（秒）</label>
                  <select
                    id="refreshInterval"
                    name="refreshInterval"
                    value={settings.refreshInterval}
                    onChange={handleChange}
                    disabled={!settings.autoRefresh}
                    className="select-input"
                  >
                    <option value={10}>10秒</option>
                    <option value={30}>30秒</option>
                    <option value={60}>1分钟</option>
                    <option value={300}>5分钟</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* 进程设置 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">进程管理</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="showSystemProcesses" className="font-medium">显示系统进程</label>
                  <input
                    type="checkbox"
                    id="showSystemProcesses"
                    name="showSystemProcesses"
                    checked={settings.showSystemProcesses}
                    onChange={handleChange}
                    className="checkbox"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="confirmDangerousActions" className="font-medium">危险操作确认</label>
                  <input
                    type="checkbox"
                    id="confirmDangerousActions"
                    name="confirmDangerousActions"
                    checked={settings.confirmDangerousActions}
                    onChange={handleChange}
                    className="checkbox"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button 
              className="btn btn-secondary"
              onClick={onClose}
            >
              取消
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
