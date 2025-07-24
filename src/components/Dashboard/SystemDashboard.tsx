import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { SystemInfo, NetworkInterface } from '../../types/system';

// 定义后端返回的详细系统信息接口
interface DetailedSystemInfo {
  os_info: any;
  cpu_info: any;
  memory_info: any;
  gpu_info: any[];
  network_info: any[];
  disk_info: any[];
  hostname: string;
  active_connections: number;
}
import SystemOverview from './SystemOverview';
import HardwareMonitor from './HardwareMonitor';
import NetworkStatus from './NetworkStatus';
import DiskUsage from './DiskUsage';
import LoadingSpinner from '../Common/LoadingSpinner';

// 创建一个全局缓存，避免每次切换页面都重新获取数据
let cachedSystemInfo: SystemInfo | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 缓存有效期5分钟

const SystemDashboard: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(cachedSystemInfo);
  const [loading, setLoading] = useState<boolean>(!cachedSystemInfo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 如果有缓存且缓存未过期，直接使用缓存
    const now = Date.now();
    if (cachedSystemInfo && now - lastFetchTime < CACHE_DURATION) {
      console.log('使用缓存的系统信息，缓存时间:', new Date(lastFetchTime).toLocaleTimeString());
      setSystemInfo(cachedSystemInfo);
      setLoading(false);
    } else {
      // 否则重新获取数据
      fetchSystemInfo();
    }

    // 设置定时刷新，每2分钟刷新一次
    const interval = setInterval(fetchSystemInfo, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);

      // 创建基本的系统信息对象
      const info: SystemInfo = {
        os: {
          name: '',
          version: '',
          kernel_version: '',
          architecture: '',
          hostname: '',
          uptime: 0
        },
        hardware: {
          cpu: {
            brand: '',
            cores: 0,
            frequency: 0,
            usage: 0
          },
          memory: {
            total: 0,
            used: 0,
            available: 0,
            usage_percent: 0
          },
          gpu: [] // 确保gpu是一个空数组而不是undefined
        },
        network: {
          interfaces: [],
          active_connections: 0
        },
        disk: []
      };

      // 使用get_system_info_detailed函数获取系统信息
      try {
        const detailedInfo = await invoke<DetailedSystemInfo>('get_system_info_detailed');
        console.log('获取到系统信息:', detailedInfo);
        
        // 解析CPU信息
        if (detailedInfo.cpu_info && typeof detailedInfo.cpu_info === 'object') {
          const cpuData = detailedInfo.cpu_info;
          info.hardware.cpu.brand = cpuData.Name || "未知处理器";
          info.hardware.cpu.cores = cpuData.NumberOfCores || 4;
          info.hardware.cpu.frequency = cpuData.MaxClockSpeed ? cpuData.MaxClockSpeed * 1000000 : 3000000000; // MHz to Hz
          info.hardware.cpu.usage = 30; // 默认使用率
        } else {
          // 如果没有CPU信息，设置默认值
          info.hardware.cpu.brand = "未知处理器";
          info.hardware.cpu.cores = 4;
          info.hardware.cpu.frequency = 3000000000;
          info.hardware.cpu.usage = 30;
        }
        
        // 解析内存信息
        if (detailedInfo.memory_info && typeof detailedInfo.memory_info === 'object') {
          const memoryData = detailedInfo.memory_info;
          // 转换KB为字节
          const totalMemory = (memoryData.TotalVisibleMemorySize || 0) * 1024;
          const freeMemory = (memoryData.FreePhysicalMemory || 0) * 1024;
          const usedMemory = totalMemory - freeMemory;

          info.hardware.memory.total = totalMemory;
          info.hardware.memory.used = usedMemory;
          info.hardware.memory.available = freeMemory;
          info.hardware.memory.usage_percent = totalMemory > 0 ? (usedMemory / totalMemory) * 100 : 0;
        } else {
          // 如果没有内存信息，设置默认值
          info.hardware.memory.total = 8 * 1024 * 1024 * 1024; // 默认8GB
          info.hardware.memory.used = 4 * 1024 * 1024 * 1024; // 默认4GB使用
          info.hardware.memory.available = 4 * 1024 * 1024 * 1024; // 默认4GB可用
          info.hardware.memory.usage_percent = 50; // 默认50%使用率
        }
        
        // 解析操作系统信息
        if (detailedInfo.os_info && typeof detailedInfo.os_info === 'object') {
          const osData = detailedInfo.os_info;
          info.os.name = osData.Caption || "未知操作系统";
          info.os.version = osData.Version || "";
          info.os.kernel_version = osData.BuildNumber || "";
          info.os.architecture = osData.OSArchitecture || "x64";
        } else {
          info.os.name = "未知操作系统";
          info.os.version = "";
          info.os.kernel_version = "";
          info.os.architecture = "x64";
        }
        
        // 设置主机名
        info.os.hostname = detailedInfo.hostname || "PC";
        
        // 解析GPU信息
        if (detailedInfo.gpu_info && Array.isArray(detailedInfo.gpu_info)) {
          // 确保gpu是一个数组
          if (!info.hardware.gpu) {
            info.hardware.gpu = [];
          }
          
          for (const gpu of detailedInfo.gpu_info) {
            if (gpu && gpu.Name && !gpu.Name.toLowerCase().includes('remote') && !gpu.Name.toLowerCase().includes('basic display')) {
              let vendor = 'Unknown';
              
              // 确定GPU厂商
              const name = gpu.Name.toLowerCase();
              if (name.includes('nvidia')) {
                vendor = 'NVIDIA';
              } else if (name.includes('amd') || name.includes('radeon')) {
                vendor = 'AMD';
              } else if (name.includes('intel')) {
                vendor = 'Intel';
              }
              
              // 解析内存大小和使用情况
              let memory = undefined;
              let memory_used = undefined;
              let usage = undefined;
              let temperature = undefined;
              
              // 如果是NVIDIA显卡且有详细信息
              if (gpu.TotalMemoryMB && gpu.UsedMemoryMB) {
                memory = parseFloat(gpu.TotalMemoryMB) * 1024 * 1024; // MB to bytes
                memory_used = parseFloat(gpu.UsedMemoryMB) * 1024 * 1024; // MB to bytes
                usage = parseFloat(gpu.Utilization) || undefined;
                temperature = parseFloat(gpu.Temperature) || undefined;
              } else if (gpu.AdapterRAM && gpu.AdapterRAM > 0) {
                memory = gpu.AdapterRAM; // 已经是字节
                // 对于非NVIDIA显卡，我们无法获取实时使用情况
                memory_used = undefined;
                usage = undefined;
                temperature = undefined;
              }
              
              info.hardware.gpu.push({
                name: gpu.Name,
                vendor,
                memory,
                memory_used,
                usage,
                temperature
              });
            }
          }
        }
        
        // 解析磁盘信息
        if (detailedInfo.disk_info && Array.isArray(detailedInfo.disk_info)) {
          for (const disk of detailedInfo.disk_info) {
            if (disk && disk.DriveLetter) {
              const totalSpace = disk.Size || 0;
              const availableSpace = disk.SizeRemaining || 0;
              const usedSpace = totalSpace - availableSpace;
              const usagePercent = totalSpace > 0 ? (usedSpace / totalSpace) * 100 : 0;

              info.disk.push({
                name: disk.DriveLetter + ':',
                mount_point: disk.DriveLetter + ':\\',
                file_system: disk.FileSystem || 'NTFS',
                total_space: totalSpace,
                available_space: availableSpace,
                used_space: usedSpace,
                usage_percent: usagePercent,
                is_removable: false // 无法准确获取
              });
            }
          }
        }
        
        // 解析网络信息
        if (detailedInfo.network_info && Array.isArray(detailedInfo.network_info)) {
          for (const adapter of detailedInfo.network_info) {
            if (adapter && adapter.Name) {
              // 解析链接速度
              let speed = 0;
              if (adapter.LinkSpeed) {
                const match = adapter.LinkSpeed.match(/(\d+)/);
                if (match) {
                  speed = parseInt(match[1]) * 1000000; // Mbps to bps
                }
              }

              // 创建网络接口对象
              const iface: NetworkInterface = {
                name: adapter.Name,
                display_name: adapter.InterfaceDescription || adapter.Name,
                is_up: true, // 因为我们只获取状态为Up的接口
                is_loopback: adapter.Name.toLowerCase().includes('loopback'),
                mac_address: adapter.MacAddress || '',
                ip_addresses: [], // 需要单独获取IP地址
                bytes_sent: 0, // 无法准确获取
                bytes_received: 0, // 无法准确获取
                speed
              };

              info.network.interfaces.push(iface);
            }
          }
        }
        
        // 设置活动连接数
        info.network.active_connections = detailedInfo.active_connections || 0;
      } catch (err) {
        console.error('解析系统信息失败:', err);
      }

      // 更新缓存和最后获取时间
      cachedSystemInfo = info;
      lastFetchTime = Date.now();

      setSystemInfo(info);
      setError(null);
    } catch (err) {
      console.error('获取系统信息完全失败:', err);
      setError('获取系统信息失败: ' + (err as string));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !systemInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️ 获取系统信息失败</div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">{error}</div>
          <button
            onClick={fetchSystemInfo}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!systemInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">没有可用的系统信息。</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 系统概览 - 包含标题 */}
      <SystemOverview systemInfo={systemInfo} title="系统仪表盘" />

      {/* 硬件监控 - 展示所有硬件信息 */}
      <HardwareMonitor hardware={systemInfo.hardware} />

      {/* 网络和磁盘 - 并排显示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <NetworkStatus network={systemInfo.network} />
        <DiskUsage disks={systemInfo.disk} />
      </div>
    </div>
  );
};

export default SystemDashboard;