export interface SystemInfo {
  os: OperatingSystemInfo;
  hardware: HardwareInfo;
  network: NetworkInfo;
  disk: DiskInfo[];
}

export interface OperatingSystemInfo {
  name: string;
  version: string;
  kernel_version: string;
  architecture: string;
  hostname: string;
  uptime: number;
  boot_time?: number;
}

export interface HardwareInfo {
  cpu: CpuInfo;
  memory: MemoryInfo;
  gpu?: GpuInfo[];
}

export interface CpuInfo {
  brand: string;
  cores: number;
  frequency: number;
  usage: number;
  temperature?: number;
}

export interface MemoryInfo {
  total: number;
  used: number;
  available: number;
  usage_percent: number;
  swap_total?: number;
  swap_used?: number;
}

export interface GpuInfo {
  name: string;
  vendor: string;
  memory?: number;
  memory_used?: number;
  temperature?: number;
  usage?: number;
}

export interface NetworkInfo {
  interfaces: NetworkInterface[];
  active_connections: number;
}

export interface NetworkInterface {
  name: string;
  display_name: string;
  bytes_sent: number;
  bytes_received: number;
  mac_address: string;
  ip_addresses: string[];
  is_up: boolean;
  is_loopback: boolean;
  speed: number;
}

export interface DiskInfo {
  name: string;
  mount_point: string;
  file_system: string;
  total_space: number;
  available_space: number;
  used_space: number;
  usage_percent: number;
  is_removable: boolean;
}

export interface SystemSettings {
  theme: 'light' | 'dark' | 'auto';
  auto_refresh: boolean;
  refresh_interval: number;
  show_system_notifications: boolean;
  startup_tab: 'dashboard' | 'ports' | 'files' | 'processes' | 'docker';
}

export interface SystemStatus {
  system_info: {
    os_name: string;
    os_version: string;
    kernel_version: string;
    hostname: string;
    cpu_count: number;
    used_memory: number;
    total_memory: number;
    used_swap: number;
    total_swap: number;
  };
  api_status: {
    port_monitor: boolean;
    process_analyzer: boolean;
    file_monitor: boolean;
    docker: boolean;
  };
  version: string;
}