import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { FileOccupancy } from '../../types/file';

interface FileOccupancyCardProps {
  fileOccupancy: FileOccupancy;
}

const FileOccupancyCard: React.FC<FileOccupancyCardProps> = ({ fileOccupancy }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getImpactColor = () => {
    switch (fileOccupancy.impact.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleKillProcess = async (pid: number) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await invoke<boolean>('kill_process', { pid });
      
      if (result) {
        setSuccess(`成功终止进程 (PID: ${pid})`);
      } else {
        setError('无法终止进程，可能需要管理员权限');
      }
    } catch (err) {
      console.error('终止进程失败:', err);
      setError('终止进程失败: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(fileOccupancy.filePath)
      .then(() => {
        setSuccess('文件路径已复制到剪贴板');
        setTimeout(() => setSuccess(null), 3000);
      })
      .catch(err => {
        setError('复制路径失败: ' + err);
      });
  };

  const handleLocateFile = async () => {
    try {
      // 使用Tauri API在资源管理器中显示文件
      await invoke('show_in_folder', { path: fileOccupancy.filePath });
      setSuccess('已在资源管理器中显示文件');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('定位文件失败:', err);
      setError('定位文件失败: ' + err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <span className="text-yellow-500 text-2xl">⚠️</span>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold">
            {fileOccupancy.fileName} 被占用
          </h3>
          
          <p className="text-gray-600 mt-2">
            <span className="font-medium">文件路径：</span>
            <span className="text-sm font-mono bg-gray-100 p-1 rounded">
              {fileOccupancy.filePath}
            </span>
          </p>
          
          {fileOccupancy.occupiedBy.map((process, index) => (
            <div key={index} className="mt-3 border-t border-gray-200 pt-3">
              <p className="font-medium">占用程序：{process.friendlyName}</p>
              <p className="text-sm text-gray-600">进程ID：{process.pid}</p>
              {process.exe_path && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">可执行文件：</span>
                  <span className="text-xs font-mono bg-gray-100 p-1 rounded">
                    {process.exe_path}
                  </span>
                </p>
              )}
            </div>
          ))}
          
          <div className="mt-3 border-t border-gray-200 pt-3">
            <p className="font-medium">占用原因：</p>
            <p className="text-gray-600">{fileOccupancy.reason}</p>
          </div>
          
          <div className="mt-3 border-t border-gray-200 pt-3">
            <p className="font-medium">影响程度：</p>
            <p className={getImpactColor()}>
              {fileOccupancy.impact === 'High' ? '高' : 
               fileOccupancy.impact === 'Medium' ? '中' : '低'}
            </p>
          </div>
          
          {fileOccupancy.solutions.length > 0 && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <p className="font-medium">解决方案：</p>
              <ul className="mt-2 space-y-2">
                {fileOccupancy.solutions.map((solution, index) => (
                  <li key={index} className="text-gray-600">
                    <p>{solution.description}</p>
                    <p className="text-sm text-gray-500">
                      风险等级：
                      <span className={
                        solution.risk_level === '高' ? 'text-red-600' : 
                        solution.risk_level === '中' ? 'text-yellow-600' : 'text-green-600'
                      }>
                        {solution.risk_level}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-3 text-sm text-green-600 bg-green-50 p-2 rounded">
              {success}
            </div>
          )}
          
          <div className="mt-4 flex flex-wrap gap-2">
            <button 
              className="btn btn-secondary"
              onClick={handleLocateFile}
            >
              🔍 定位文件
            </button>
            
            {fileOccupancy.occupiedBy.map((process, index) => (
              <button 
                key={index}
                className="btn btn-danger"
                onClick={() => handleKillProcess(process.pid)}
                disabled={loading}
              >
                ❌ 关闭 {process.friendlyName}
              </button>
            ))}
            
            <button 
              className="btn btn-secondary"
              onClick={handleCopyPath}
            >
              📋 复制路径
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileOccupancyCard;