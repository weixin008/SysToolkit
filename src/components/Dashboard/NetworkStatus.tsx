
import React from 'react';
import { NetworkInfo, NetworkInterface } from '../../types/system';

interface NetworkStatusProps {
  network?: NetworkInfo;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ network }) => {
  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatSpeed = (bps?: number) => {
    if (bps === undefined || bps === null) return '0 bps';
    if (bps < 1000) return `${bps} bps`;
    if (bps < 1000000) return `${(bps / 1000).toFixed(1)} Kbps`;
    if (bps < 1000000000) return `${(bps / 1000000).toFixed(1)} Mbps`;
    return `${(bps / 1000000000).toFixed(1)} Gbps`;
  };

  const getInterfaceIcon = (name?: string, isUp?: boolean) => {
    if (!isUp) return '🔴';
    const lowerCaseName = name?.toLowerCase() || '';
    if (lowerCaseName.includes('wifi') || lowerCaseName.includes('wlan')) return '📶';
    if (lowerCaseName.includes('ethernet') || lowerCaseName.includes('eth')) return '🌐';
    if (lowerCaseName.includes('loopback') || lowerCaseName.includes('lo')) return '🔄';
    return '🔗';
  };

  if (!network) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-gray-100">
          🌐 网络状态
        </h3>
        <p>数据加载中...</p>
      </div>
    );
  }

  const cleanedInterfaces = (network.interfaces || []).map(iface => {
    let displayName = iface.display_name || '';
    const nameLower = iface.name?.toLowerCase() || '';
    const displayLower = displayName.toLowerCase();
    
    const containsGarbage = displayName.includes('□') || 
                           displayName.includes('') || 
                           displayName.includes('?') ||
                           displayName.includes('锟');
    
    if (containsGarbage || displayName === iface.name) {
      if (nameLower.includes('wi-fi') || nameLower.includes('wlan') || displayLower.includes('wi-fi') || displayLower.includes('wireless')) {
        displayName = 'Wi-Fi';
      } else if (nameLower.includes('ethernet') || nameLower.includes('eth') || displayLower.includes('ethernet') || displayLower.includes('以太网')) {
        displayName = '以太网';
      } else if (nameLower.includes('docker') || displayLower.includes('docker')) {
        displayName = 'Docker 网络';
      } else if (nameLower.includes('wsl') || displayLower.includes('wsl')) {
        displayName = 'WSL 网络';
      } else if (nameLower.includes('vethernet') || displayLower.includes('vethernet')) {
        if (nameLower.includes('default') || displayLower.includes('default')) {
          displayName = '虚拟以太网 (Default Switch)';
        } else {
          displayName = '虚拟网络';
        }
      } else if (nameLower.includes('loopback') || nameLower.includes('lo') || displayLower.includes('loopback')) {
        displayName = '回环接口';
      } else if (nameLower.includes('vpn') || displayLower.includes('vpn')) {
        displayName = 'VPN 网络';
      } else {
        displayName = `网络接口 ${iface.name || ''}`;
      }
    }
    
    return {
      ...iface,
      display_name: displayName
    };
  });
  
  const uniqueInterfaces = cleanedInterfaces.reduce<NetworkInterface[]>((acc, current) => {
    const existingInterface = acc.find(item => 
      item.display_name === current.display_name && 
      JSON.stringify(item.ip_addresses) === JSON.stringify(current.ip_addresses)
    );
    
    if (!existingInterface) {
      return [...acc, current];
    } else {
      return acc;
    }
  }, []);
  
  const sortedInterfaces = uniqueInterfaces.sort((a, b) => {
    const aName = a.display_name?.toLowerCase() || '';
    const bName = b.display_name?.toLowerCase() || '';
    
    const typeOrder: Record<string, number> = {
      'wi-fi': 1,
      '以太网': 2,
      'docker': 3,
      'wsl': 4,
      '虚拟': 5,
      '回环': 99
    };
    
    const getTypeOrder = (name: string): number => {
      for (const [key, value] of Object.entries(typeOrder)) {
        if (name.includes(key)) return value;
      }
      return 10;
    };
    
    const aOrder = getTypeOrder(aName);
    const bOrder = getTypeOrder(bName);
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    const aHasIp = a.ip_addresses && a.ip_addresses.length > 0;
    const bHasIp = b.ip_addresses && b.ip_addresses.length > 0;
    
    if (aHasIp && !bHasIp) return -1;
    if (!aHasIp && bHasIp) return 1;
    
    return aName.localeCompare(bName);
  });
  
  const activeInterfaces = sortedInterfaces.filter(iface => iface.is_up && !iface.is_loopback);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-gray-100">
        🌐 网络状态
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-left hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
          onClick={() => window.open('ms-settings:network-status', '_blank')}
        >
          <div className="flex items-center">
            <span className="text-lg mr-2">📊</span>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-300">活跃连接</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {network.active_connections || 0}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">点击查看详情</p>
            </div>
          </div>
        </button>
        
        <button 
          className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-left hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
          onClick={() => window.open('ms-settings:network-ethernet', '_blank')}
        >
          <div className="flex items-center">
            <span className="text-lg mr-2">🔗</span>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-300">网络接口</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {activeInterfaces.length}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">点击查看详情</p>
            </div>
          </div>
        </button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-6 text-center">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          点击网络接口卡片可以打开对应的网络设置
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">网络接口</h4>
        
        {sortedInterfaces.map((iface, index) => (
          <div 
            key={index} 
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => {
              import('@tauri-apps/api/tauri').then(({ invoke }) => {
                let settingsUrl = 'ms-settings:network-status';
                const ifaceNameLower = iface.name?.toLowerCase() || '';
                const displayNameLower = iface.display_name?.toLowerCase() || '';

                if (ifaceNameLower.includes('wlan') || ifaceNameLower.includes('wifi') || displayNameLower.includes('wi-fi')) {
                  settingsUrl = 'ms-settings:network-wifi';
                } else if (ifaceNameLower.includes('eth') || displayNameLower.includes('以太网')) {
                  settingsUrl = 'ms-settings:network-ethernet';
                } else if (ifaceNameLower.includes('vpn') || displayNameLower.includes('vpn')) {
                  settingsUrl = 'ms-settings:network-vpn';
                }
                
                // 使用open_with_default_app函数打开URL，避免命令提示符弹出
                invoke('open_with_default_app', { path: settingsUrl })
                .catch(err => {
                  console.error('打开网络设置失败:', err);
                  window.open(settingsUrl, '_blank');
                });
              });
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="mr-2">{getInterfaceIcon(iface.name, iface.is_up)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {iface.display_name || iface.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {iface.name}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    点击查看详情
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  iface.is_up 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}>
                  {iface.is_up ? '已连接' : '未连接'}
                </span>
              </div>
            </div>
            
            {iface.is_up && (
              <div className="space-y-1">
                {(iface.ip_addresses || []).length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-medium">IP地址：</span>
                    {(iface.ip_addresses || []).slice(0, 2).join(', ')}
                    {(iface.ip_addresses || []).length > 2 && ` +${(iface.ip_addresses || []).length - 2}`}
                  </p>
                )}
                
                {iface.mac_address && (
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-medium">MAC地址：</span>
                    <span className="font-mono">{iface.mac_address}</span>
                  </p>
                )}
                
                {iface.speed && (
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-medium">速度：</span>
                    {formatSpeed(iface.speed)}
                  </p>
                )}
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>⬆️ {formatBytes(iface.bytes_sent)}</span>
                  <span>⬇️ {formatBytes(iface.bytes_received)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkStatus;
