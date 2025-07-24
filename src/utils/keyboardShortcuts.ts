import { useEffect } from 'react';

// 快捷键配置类型
export interface ShortcutConfig {
  key: string;          // 键名，如 'F5', 'Escape', 'a'
  ctrlKey?: boolean;    // 是否需要按住 Ctrl 键
  altKey?: boolean;     // 是否需要按住 Alt 键
  shiftKey?: boolean;   // 是否需要按住 Shift 键
  metaKey?: boolean;    // 是否需要按住 Meta 键 (Windows 键或 Mac 的 Command 键)
  action: () => void;   // 触发的动作
  description: string;  // 快捷键描述
}

// 默认快捷键配置
export const defaultShortcuts: ShortcutConfig[] = [
  {
    key: 'F5',
    action: () => {
      // 刷新当前视图的操作将在组件中实现
      console.log('刷新视图');
    },
    description: '刷新当前视图'
  },
  {
    key: 'Escape',
    action: () => {
      // 关闭对话框的操作将在组件中实现
      console.log('关闭对话框');
    },
    description: '关闭当前对话框'
  },
  {
    key: '1',
    altKey: true,
    action: () => {
      // 切换到端口监控的操作将在组件中实现
      console.log('切换到端口监控');
    },
    description: '切换到端口监控'
  },
  {
    key: '2',
    altKey: true,
    action: () => {
      // 切换到文件占用的操作将在组件中实现
      console.log('切换到文件占用');
    },
    description: '切换到文件占用'
  },
  {
    key: '3',
    altKey: true,
    action: () => {
      // 切换到进程管理的操作将在组件中实现
      console.log('切换到进程管理');
    },
    description: '切换到进程管理'
  },
  {
    key: '4',
    altKey: true,
    action: () => {
      // 切换到Docker容器的操作将在组件中实现
      console.log('切换到Docker容器');
    },
    description: '切换到Docker容器'
  },
  {
    key: 'h',
    ctrlKey: true,
    action: () => {
      // 显示快捷键帮助的操作将在组件中实现
      console.log('显示快捷键帮助');
    },
    description: '显示快捷键帮助'
  },
  {
    key: ',',
    ctrlKey: true,
    action: () => {
      // 打开设置的操作将在组件中实现
      console.log('打开设置');
    },
    description: '打开设置'
  }
];

// 自定义 Hook，用于在组件中注册快捷键
export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 如果用户正在输入框中输入，则不触发快捷键
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        if (
          event.key === shortcut.key &&
          (shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey) &&
          (shortcut.altKey === undefined || event.altKey === shortcut.altKey) &&
          (shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey) &&
          (shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey)
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

// 快捷键帮助组件
export interface ShortcutHelpProps {
  onClose: () => void;
}

export const formatShortcut = (shortcut: ShortcutConfig): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push('Meta');
  
  parts.push(shortcut.key);
  
  return parts.join(' + ');
};