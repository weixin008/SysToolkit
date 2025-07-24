import React from 'react';
import { defaultShortcuts, formatShortcut, ShortcutConfig } from '../../utils/keyboardShortcuts';

interface ShortcutHelpProps {
  onClose: () => void;
  shortcuts?: ShortcutConfig[];
}

const ShortcutHelp: React.FC<ShortcutHelpProps> = ({ onClose, shortcuts = defaultShortcuts }) => {
  // 按类别对快捷键进行分组
  const navigationShortcuts = shortcuts.filter(s => 
    s.description.includes('切换') || s.description.includes('导航')
  );
  
  const actionShortcuts = shortcuts.filter(s => 
    s.description.includes('刷新') || 
    s.description.includes('打开') || 
    s.description.includes('关闭')
  );
  
  const otherShortcuts = shortcuts.filter(s => 
    !navigationShortcuts.includes(s) && !actionShortcuts.includes(s)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">键盘快捷键</h2>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {navigationShortcuts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">导航</h3>
                <table className="w-full">
                  <tbody>
                    {navigationShortcuts.map((shortcut, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-2 font-medium">{shortcut.description}</td>
                        <td className="py-2 text-right">
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                            {formatShortcut(shortcut)}
                          </kbd>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {actionShortcuts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">操作</h3>
                <table className="w-full">
                  <tbody>
                    {actionShortcuts.map((shortcut, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-2 font-medium">{shortcut.description}</td>
                        <td className="py-2 text-right">
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                            {formatShortcut(shortcut)}
                          </kbd>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {otherShortcuts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">其他</h3>
                <table className="w-full">
                  <tbody>
                    {otherShortcuts.map((shortcut, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-2 font-medium">{shortcut.description}</td>
                        <td className="py-2 text-right">
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                            {formatShortcut(shortcut)}
                          </kbd>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              提示：按下 <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Ctrl + H</kbd> 随时查看此帮助
            </p>
            <button 
              className="btn btn-primary"
              onClick={onClose}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutHelp;