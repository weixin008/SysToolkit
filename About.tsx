/*
 * 系统监控助手 - 一个现代化的Windows系统监控和管理工具
 * Copyright (C) 2025 系统监控助手团队
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/shell';
// 导入图片
import gzhQRCode from './gzh.png';
import zsmQRCode from './zsm.png';

interface AboutProps {
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ onClose }) => {
  const openGithub = async () => {
    await open('https://github.com/weixin008/SysToolkit');
  };

  const openLicense = async () => {
    await open('https://www.gnu.org/licenses/gpl-3.0.html');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            关于系统监控助手
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-auto">
          <div className="flex flex-col items-center mb-6">
            <div className="text-6xl mb-2">🖥️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">系统监控助手</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">版本 1.0.0</p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">项目简介</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              系统监控助手是一个现代化的Windows系统监控和管理工具，提供直观的界面和丰富的系统管理功能。
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              本工具可以帮助您监控系统资源、管理端口和进程、检测文件占用、管理Docker容器，以及快速访问系统工具。
            </p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">开源协议</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              本项目采用 GNU General Public License v3.0 (GPLv3) 开源协议。
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              这意味着您可以自由使用、修改和分发本软件，但如果您分发修改后的版本，必须以相同的许可证开源您的修改。
            </p>
            <button
              onClick={openLicense}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              查看完整许可证
            </button>
          </div>
          
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">技术栈</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>前端：React、TypeScript、Tailwind CSS</li>
              <li>后端：Rust、Tauri</li>
              <li>构建工具：Vite</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">联系我们</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              如有问题或建议，请通过以下方式联系我们：
            </p>
            <button
              onClick={openGithub}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub 项目主页
            </button>
          </div>
          
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">关注与支持</h4>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <div className="flex flex-col items-center">
                <img src={gzhQRCode} alt="微信公众号" className="w-32 h-32 mb-2" />
                <p className="text-sm text-gray-700 dark:text-gray-300">微信公众号：开发者豆子</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">GitHub：weixin008</p>
              </div>
              <div className="flex flex-col items-center">
                <img src={zsmQRCode} alt="赞赏码" className="w-32 h-32 mb-2" />
                <p className="text-sm text-gray-700 dark:text-gray-300">感谢您的赞赏支持</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2025 系统监控助手团队。保留所有权利。
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;