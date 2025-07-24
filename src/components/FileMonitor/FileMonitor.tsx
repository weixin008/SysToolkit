import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { FileOccupancy } from '../../types/file';
import FileOccupancyCard from './FileOccupancyCard';
import LoadingSpinner from '../Common/LoadingSpinner';

const FileMonitor: React.FC = () => {
  const [filePath, setFilePath] = useState<string>('');
  const [fileOccupancy, setFileOccupancy] = useState<FileOccupancy | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  const handleFilePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilePath(e.target.value);
  };

  const handleSelectFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          { name: '所有文件', extensions: ['*'] }
        ]
      });
      
      if (selected && !Array.isArray(selected)) {
        setFilePath(selected);
        checkFileOccupancy(selected);
      }
    } catch (err) {
      console.error('选择文件失败:', err);
      setError('选择文件失败: ' + err);
    }
  };

  const checkFileOccupancy = async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const occupancy = await invoke<FileOccupancy | null>('check_file_occupancy', { filePath: path });
      
      setFileOccupancy(occupancy);
      
      // 添加到最近检查的文件列表
      if (path && !recentFiles.includes(path)) {
        setRecentFiles(prev => [path, ...prev].slice(0, 5));
      }
    } catch (err) {
      console.error('检查文件占用失败:', err);
      setError('检查文件占用失败: ' + err);
      setFileOccupancy(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filePath) {
      checkFileOccupancy(filePath);
    }
  };

  const handleRecentFileClick = (path: string) => {
    setFilePath(path);
    checkFileOccupancy(path);
  };

  return (
    <div className="content-container">
      <h2 className="text-2xl font-bold mb-4">📁 文件占用监控</h2>
      
      <div className="file-check-container rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">检查文件占用</h3>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex items-center mb-4">
            <input
              type="text"
              className="flex-1 rounded-l-md py-2 px-3"
              placeholder="输入文件路径..."
              value={filePath}
              onChange={handleFilePathChange}
            />
            <button
              type="button"
              className="btn btn-secondary border-l-0 rounded-r-md py-2 px-4"
              onClick={handleSelectFile}
            >
              浏览...
            </button>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!filePath || loading}
          >
            {loading ? '检查中...' : '检查文件占用'}
          </button>
        </form>
        
        {recentFiles.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">最近检查的文件:</h4>
            <ul className="space-y-1">
              {recentFiles.map((path, index) => (
                <li key={index}>
                  <button
                    className="text-blue-600 hover:text-blue-800 text-sm hover:underline truncate max-w-full block"
                    onClick={() => handleRecentFileClick(path)}
                  >
                    {path}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <LoadingSpinner message="正在检查文件占用情况..." />
      ) : fileOccupancy ? (
        <FileOccupancyCard fileOccupancy={fileOccupancy} />
      ) : filePath && !error ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                文件未被占用，可以自由操作。
              </p>
            </div>
          </div>
        </div>
      ) : null}
      
      <div className="file-tip-container rounded p-4 mt-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">
              <strong>提示：</strong> 当文件无法删除、移动或修改时，可以使用此工具查找占用该文件的程序。
            </p>
            <p className="text-sm mt-2">
              常见的文件占用情况包括：
            </p>
            <ul className="list-disc list-inside text-sm mt-1">
              <li>文档被Office程序打开</li>
              <li>PDF文件被阅读器查看</li>
              <li>图片被图像编辑器编辑</li>
              <li>程序正在运行中</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileMonitor;