use serde::{Deserialize, Serialize};
use sysinfo::{System, Networks, Disks, RefreshKind};
use std::time::{SystemTime, UNIX_EPOCH, Duration};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemInfo {
    pub os: OsInfo,
    pub hardware: HardwareInfo,
    pub network: NetworkInfo,
    pub disk: Vec<DiskDetail>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OsInfo {
    pub name: String,
    pub kernel_version: String,
    pub version: String,
    pub hostname: String,
    pub uptime: u64,
    pub boot_time: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HardwareInfo {
    pub cpu: CpuInfo,
    pub memory: MemoryInfo,
    pub gpus: Vec<GpuInfo>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CpuInfo {
    pub brand: String,
    pub frequency: u64,
    pub cores: usize,
    pub usage: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemoryInfo {
    pub total: u64,
    pub used: u64,
    pub free: u64,
    pub swap_total: u64,
    pub swap_used: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GpuInfo {
    pub name: String,
    pub vendor: String,
    pub memory: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NetworkInfo {
    pub interfaces: Vec<NetworkInterface>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NetworkInterface {
    pub name: String,
    pub received: u64,
    pub transmitted: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiskDetail {
    pub name: String,
    pub mount_point: String,
    pub total_space: u64,
    pub available_space: u64,
    pub file_system: String,
}

pub fn get_all_system_info() -> SystemInfo {
    let mut sys = System::new_with_specifics(
        RefreshKind::everything()
    );
    sys.refresh_all();

    let uptime = System::uptime();
    let boot_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(Duration::from_secs(0))
        .as_secs()
        .saturating_sub(uptime);


    let os = OsInfo {
        name: System::name().unwrap_or_else(|| "N/A".to_string()),
        kernel_version: System::kernel_version().unwrap_or_else(|| "N/A".to_string()),
        version: System::os_version().unwrap_or_else(|| "N/A".to_string()),
        hostname: System::host_name().unwrap_or_else(|| "N/A".to_string()),
        uptime,
        boot_time,
    };

    let cpus = sys.cpus();
    let cpu = CpuInfo {
        brand: cpus.get(0).map_or("N/A".to_string(), |c| c.brand().to_string()),
        frequency: cpus.get(0).map_or(0, |c| c.frequency()),
        cores: cpus.len(),
        usage: cpus.iter().map(|c| c.cpu_usage()).sum::<f32>() / cpus.len() as f32,
    };

    let memory = MemoryInfo {
        total: sys.total_memory(),
        used: sys.used_memory(),
        free: sys.free_memory(),
        swap_total: sys.total_swap(),
        swap_used: sys.used_swap(),
    };
    
    let gpus = Vec::new();

    let hardware = HardwareInfo {
        cpu,
        memory,
        gpus,
    };

    // Get network information
    let networks = Networks::new_with_refreshed_list();
    let interfaces = networks.iter().map(|(name, data)| {
        NetworkInterface {
            name: name.clone(),
            received: data.received(),
            transmitted: data.transmitted(),
        }
    }).collect();
    let network = NetworkInfo { interfaces };

    // Get disk information
    let disks = Disks::new_with_refreshed_list();
    let disk = disks.iter().map(|d| {
        DiskDetail {
            name: d.name().to_string_lossy().into_owned(),
            mount_point: d.mount_point().to_string_lossy().into_owned(),
            total_space: d.total_space(),
            available_space: d.available_space(),
            file_system: d.file_system().to_string_lossy().into_owned(),
        }
    }).collect();

    SystemInfo {
        os,
        hardware,
        network,
        disk,
    }
}
