import { useNotification } from '../context/NotificationContext';

// 错误类型定义
export enum ErrorType {
  NETWORK = 'network',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  SYSTEM = 'system',
  UNKNOWN = 'unknown'
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
  suggestion?: string;
}

// 创建错误信息
export function createError(
  type: ErrorType,
  message: string,
  details?: string,
  code?: string,
  suggestion?: string
): ErrorInfo {
  return {
    type,
    message,
    details,
    code,
    suggestion
  };
}

// 解析Tauri错误
export function parseTauriError(error: any): ErrorInfo {
  // 尝试解析错误信息
  let message = '发生未知错误';
  let type = ErrorType.UNKNOWN;
  let details = '';
  let suggestion = '请尝试重新启动应用';

  if (typeof error === 'string') {
    message = error;
    
    // 根据错误消息判断类型
    if (error.includes('permission') || error.includes('权限')) {
      type = ErrorType.PERMISSION;
      suggestion = '请确保应用有足够的系统权限';
    } else if (error.includes('network') || error.includes('连接') || error.includes('connection')) {
      type = ErrorType.NETWORK;
      suggestion = '请检查网络连接';
    }
  } else if (error instanceof Error) {
    message = error.message;
    details = error.stack || '';
  } else if (typeof error === 'object' && error !== null) {
    message = error.message || '发生未知错误';
    details = JSON.stringify(error);
  }

  return {
    type,
    message,
    details,
    suggestion
  };
}

// 错误处理Hook
export function useErrorHandler() {
  const { showNotification } = useNotification();

  const handleError = (error: any, context?: string) => {
    const errorInfo = parseTauriError(error);
    
    // 记录错误到控制台
    console.error(`Error in ${context || 'application'}:`, errorInfo);
    
    // 显示用户友好的错误通知
    showNotification('error', `${errorInfo.message}${errorInfo.suggestion ? `\n${errorInfo.suggestion}` : ''}`, 5000);
    
    return errorInfo;
  };

  return { handleError };
}

// 全局错误处理
export function setupGlobalErrorHandling() {
  // 捕获未处理的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
  });

  // 捕获全局错误
  window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error);
  });
}