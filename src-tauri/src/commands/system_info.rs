use sysinfo::{System, Disks, Networks, Components, RefreshKind};
use serde::{Serialize, Deserialize};
use std::process::Command;

use tauri::command;
extern crate serde_json;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OsInfo {
    name: String,
    kernel_version: String,
    version: String,
    hostname: String,
    arch: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CpuInfo {
    brand: String,
    frequency: u64,
    cores: usize,
    usage: f32,
    temperature: Option<f32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GpuInfo {
    name: String,
    vendor: String,
    memory: u64,
    usage: Option<f32>,
    temperature: Option<f32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MemoryInfo {
    total: u64,
    used: u64,
    available: u64,
    usage_percent: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DiskInfo {
    name: String,
    mount_point: String,
    total_space: u64,
    available_space: u64,
    used_space: u64,
    file_system: String,
    is_removable: bool,
    usage_percent: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NetworkInterface {
    name: String,
    display_name: String,
    bytes_sent: u64,
    bytes_received: u64,
    mac_address: String,
    ip_addresses: Vec<String>,
    is_up: bool,
    is_loopback: bool,
    speed: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NetworkInfo {
    interfaces: Vec<NetworkInterface>,
    active_connections: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HardwareInfo {
    cpu: CpuInfo,
    memory: MemoryInfo,
    gpu: Vec<GpuInfo>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SystemInfo {
    os: OsInfo,
    hardware: HardwareInfo,
    disk: Vec<DiskInfo>,
    network: NetworkInfo,
    uptime: u64,
}

#[command]
pub fn get_all_system_info() -> Result<SystemInfo, String> {
    // Create a new System instance with all refresh kinds
    let mut sys = System::new_with_specifics(
        RefreshKind::everything()
    );
    
    // Refresh system information
    sys.refresh_all();
    
    // OS Info
    let os_info = OsInfo {
        name: System::name().unwrap_or_else(|| "Unknown OS".to_string()),
        kernel_version: System::kernel_version().unwrap_or_else(|| "Unknown Kernel".to_string()),
        version: System::os_version().unwrap_or_else(|| "Unknown Version".to_string()),
        hostname: System::host_name().unwrap_or_else(|| "Unknown Hostname".to_string()),
        arch: System::cpu_arch().unwrap_or_else(|| "Unknown Arch".to_string()),
    };

    // CPU Info - Use Windows WMI to get more accurate CPU information
    let cpu = sys.global_cpu_info();
    let mut cpu_brand = cpu.brand().to_string();
    let mut cpu_frequency = cpu.frequency();
    let cores = sys.cpus().len();
    let usage = cpu.cpu_usage();
    
    // Try to get more detailed CPU info using PowerShell and WMI
    let cpu_output = Command::new("powershell")
        .args(&["-Command", "Get-WmiObject Win32_Processor | Select-Object Name, MaxClockSpeed, NumberOfCores, NumberOfLogicalProcessors | ConvertTo-Json"])
        .output();
        
    if let Ok(output) = cpu_output {
        let output_str = String::from_utf8_lossy(&output.stdout).to_string();
        if !output_str.is_empty() {
            // Try to parse as JSON array first (multiple CPUs)
            if let Ok(json) = serde_json::from_str::<Vec<serde_json::Value>>(&output_str) {
                if let Some(cpu_json) = json.first() {
                    if let Some(name) = cpu_json.get("Name").and_then(|v| v.as_str()) {
                        cpu_brand = name.trim().to_string();
                    }
                    
                    if let Some(speed) = cpu_json.get("MaxClockSpeed").and_then(|v| v.as_u64()) {
                        // WMI returns MHz, convert to Hz
                        cpu_frequency = speed * 1_000_000;
                    }
                }
            }
            // If parsing as array fails, try as single object
            else if let Ok(cpu_json) = serde_json::from_str::<serde_json::Value>(&output_str) {
                if let Some(name) = cpu_json.get("Name").and_then(|v| v.as_str()) {
                    cpu_brand = name.trim().to_string();
                }
                
                if let Some(speed) = cpu_json.get("MaxClockSpeed").and_then(|v| v.as_u64()) {
                    // WMI returns MHz, convert to Hz
                    cpu_frequency = speed * 1_000_000;
                }
            }
        }
    }
    
    let cpu_info = CpuInfo {
        brand: cpu_brand,
        frequency: cpu_frequency,
        cores,
        usage,
        temperature: None, // Will handle components separately
    };

    // Memory Info
    let total_memory = sys.total_memory();
    let available_memory = sys.available_memory();
    let used_memory = total_memory - available_memory;
    let memory_info = MemoryInfo {
        total: total_memory,
        used: used_memory,
        available: available_memory,
        usage_percent: if total_memory > 0 { (used_memory as f32 / total_memory as f32) * 100.0 } else { 0.0 },
    };

    // Components (for temperature readings)
    let components = Components::new_with_refreshed_list();
    
    // CPU temperature
    let cpu_temp = components.iter()
        .find(|c| c.label().to_lowercase().contains("cpu"))
        .map(|c| c.temperature());
    
    // Update CPU info with temperature
    let mut cpu_info = cpu_info;
    cpu_info.temperature = cpu_temp;

    // GPU Info - Use Windows WMI to get more accurate GPU information
    let mut gpu_info = Vec::new();
    
    // Try to get GPU info using PowerShell and WMI
    let gpu_output = Command::new("powershell")
        .args(&["-Command", "Get-WmiObject Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion, VideoProcessor | ConvertTo-Json"])
        .output();
        
    if let Ok(output) = gpu_output {
        let output_str = String::from_utf8_lossy(&output.stdout).to_string();
        if !output_str.is_empty() {
            // Try to parse as JSON array first
            if let Ok(json) = serde_json::from_str::<Vec<serde_json::Value>>(&output_str) {
                for gpu in json {
                    if let Some(name) = gpu.get("Name").and_then(|v| v.as_str()) {
                        // Skip Microsoft Basic Display Adapter and Remote Desktop adapters
                        if name.contains("Microsoft Basic Display") || name.contains("Remote") {
                            continue;
                        }
                        
                        let memory = gpu.get("AdapterRAM")
                            .and_then(|v| v.as_u64())
                            .unwrap_or(0);
                            
                        let vendor = if name.to_lowercase().contains("nvidia") {
                            "NVIDIA".to_string()
                        } else if name.to_lowercase().contains("amd") || name.to_lowercase().contains("radeon") {
                            "AMD".to_string()
                        } else if name.to_lowercase().contains("intel") {
                            "Intel".to_string()
                        } else {
                            "Unknown".to_string()
                        };
                        
                        // Try to find temperature from components
                        let temperature = components.iter()
                            .find(|c| c.label().to_lowercase().contains("gpu"))
                            .map(|c| c.temperature());
                            
                        gpu_info.push(GpuInfo {
                            name: name.to_string(),
                            vendor,
                            memory,
                            usage: None,
                            temperature,
                        });
                    }
                }
            }
            // If parsing as array fails, try as single object
            else if let Ok(gpu) = serde_json::from_str::<serde_json::Value>(&output_str) {
                if let Some(name) = gpu.get("Name").and_then(|v| v.as_str()) {
                    // Skip Microsoft Basic Display Adapter
                    if !name.contains("Microsoft Basic Display") && !name.contains("Remote") {
                        let memory = gpu.get("AdapterRAM")
                            .and_then(|v| v.as_u64())
                            .unwrap_or(0);
                            
                        let vendor = if name.to_lowercase().contains("nvidia") {
                            "NVIDIA".to_string()
                        } else if name.to_lowercase().contains("amd") || name.to_lowercase().contains("radeon") {
                            "AMD".to_string()
                        } else if name.to_lowercase().contains("intel") {
                            "Intel".to_string()
                        } else {
                            "Unknown".to_string()
                        };
                        
                        // Try to find temperature from components
                        let temperature = components.iter()
                            .find(|c| c.label().to_lowercase().contains("gpu"))
                            .map(|c| c.temperature());
                            
                        gpu_info.push(GpuInfo {
                            name: name.to_string(),
                            vendor,
                            memory,
                            usage: None,
                            temperature,
                        });
                    }
                }
            }
        }
    }
    
    // If we couldn't get GPU info from WMI, fall back to components
    if gpu_info.is_empty() {
        gpu_info = components.iter()
            .filter(|c| c.label().to_lowercase().contains("gpu") || c.label().to_lowercase().contains("vga"))
            .map(|c| GpuInfo {
                name: c.label().to_string(),
                vendor: "N/A".to_string(),
                memory: 0,
                usage: None,
                temperature: Some(c.temperature()),
            })
            .collect();
    }
    
    // If we still don't have any GPU info, try using dxdiag
    if gpu_info.is_empty() {
        // Create a temporary file to store dxdiag output
        let temp_file = std::env::temp_dir().join("dxdiag_output.txt");
        let temp_path = temp_file.to_string_lossy().to_string();
        
        // Run dxdiag and save output to file
        let _ = Command::new("cmd")
            .args(&["/c", "dxdiag", "/t", &temp_path])
            .output();
            
        // Wait a moment for the file to be created
        std::thread::sleep(std::time::Duration::from_secs(3));
        
        // Try to read the file
        if let Ok(content) = std::fs::read_to_string(&temp_file) {
            let mut current_card: Option<String> = None;
            let mut current_memory: Option<u64> = None;
            
            for line in content.lines() {
                if line.contains("Card name:") {
                    // Save previous card if we have one
                    if let Some(name) = current_card.take() {
                        let vendor = if name.to_lowercase().contains("nvidia") {
                            "NVIDIA".to_string()
                        } else if name.to_lowercase().contains("amd") || name.to_lowercase().contains("radeon") {
                            "AMD".to_string()
                        } else if name.to_lowercase().contains("intel") {
                            "Intel".to_string()
                        } else {
                            "Unknown".to_string()
                        };
                        
                        gpu_info.push(GpuInfo {
                            name,
                            vendor,
                            memory: current_memory.unwrap_or(0),
                            usage: None,
                            temperature: None,
                        });
                        
                        current_memory = None;
                    }
                    
                    // Extract new card name
                    if let Some(name) = line.split(':').nth(1) {
                        let name = name.trim().to_string();
                        if !name.contains("Microsoft Basic Display") && !name.contains("Remote") {
                            current_card = Some(name);
                        }
                    }
                } else if line.contains("Dedicated Memory:") && current_card.is_some() {
                    // Try to parse memory
                    if let Some(mem_str) = line.split(':').nth(1) {
                        let mem_str = mem_str.trim();
                        if mem_str.contains("MB") {
                            if let Some(num_str) = mem_str.split_whitespace().next() {
                                if let Ok(mb) = num_str.parse::<u64>() {
                                    current_memory = Some(mb * 1024 * 1024); // Convert MB to bytes
                                }
                            }
                        } else if mem_str.contains("GB") {
                            if let Some(num_str) = mem_str.split_whitespace().next() {
                                if let Ok(gb) = num_str.parse::<u64>() {
                                    current_memory = Some(gb * 1024 * 1024 * 1024); // Convert GB to bytes
                                }
                            }
                        }
                    }
                }
            }
            
            // Add the last card if we have one
            if let Some(name) = current_card {
                let vendor = if name.to_lowercase().contains("nvidia") {
                    "NVIDIA".to_string()
                } else if name.to_lowercase().contains("amd") || name.to_lowercase().contains("radeon") {
                    "AMD".to_string()
                } else if name.to_lowercase().contains("intel") {
                    "Intel".to_string()
                } else {
                    "Unknown".to_string()
                };
                
                gpu_info.push(GpuInfo {
                    name,
                    vendor,
                    memory: current_memory.unwrap_or(0),
                    usage: None,
                    temperature: None,
                });
            }
        }
        
        // Clean up the temporary file
        let _ = std::fs::remove_file(temp_file);
    }

    let hardware_info = HardwareInfo {
        cpu: cpu_info,
        memory: memory_info,
        gpu: gpu_info,
    };

    // Disk Info
    let disks = Disks::new_with_refreshed_list();
    let disk_info: Vec<DiskInfo> = disks.iter().map(|d| {
        let total_space = d.total_space();
        let available_space = d.available_space();
        let used_space = total_space - available_space;
        DiskInfo {
            name: d.name().to_string_lossy().to_string(),
            mount_point: d.mount_point().to_string_lossy().to_string(),
            total_space,
            available_space,
            used_space,
            file_system: d.file_system().to_string_lossy().to_string(),
            is_removable: d.is_removable(),
            usage_percent: if total_space > 0 { (used_space as f32 / total_space as f32) * 100.0 } else { 0.0 },
        }
    }).collect();

    // Network Info
    let networks = Networks::new_with_refreshed_list();
    let mut network_interfaces = Vec::new();
    let mut active_connections = 0;
    
    // Get network interfaces using Windows-specific commands for better detection
    let output = Command::new("powershell")
        .args(&["-Command", "Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, MacAddress, LinkSpeed | ConvertTo-Json"])
        .output();
    
    let mut win_interfaces = Vec::new();
    if let Ok(output) = output {
        let output_str = String::from_utf8_lossy(&output.stdout).to_string();
        if !output_str.is_empty() {
            // Try to parse as JSON array first
            if let Ok(json) = serde_json::from_str::<Vec<serde_json::Value>>(&output_str) {
                for iface in json {
                    if let (Some(name), Some(status)) = (
                        iface.get("Name").and_then(|v| v.as_str()),
                        iface.get("Status").and_then(|v| v.as_str())
                    ) {
                        let is_up = status.to_lowercase() == "up";
                        let description = iface.get("InterfaceDescription")
                            .and_then(|v| v.as_str())
                            .unwrap_or(name);
                        let mac = iface.get("MacAddress")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();
                        let speed_str = iface.get("LinkSpeed")
                            .and_then(|v| v.as_str())
                            .unwrap_or("0 bps");
                        
                        // Parse speed (format is like "1 Gbps" or "100 Mbps")
                        let mut speed: u64 = 0;
                        if speed_str.contains("Gbps") {
                            if let Some(val_str) = speed_str.split_whitespace().next() {
                                if let Ok(val) = val_str.parse::<f64>() {
                                    speed = (val * 1_000_000_000.0) as u64;
                                }
                            }
                        } else if speed_str.contains("Mbps") {
                            if let Some(val_str) = speed_str.split_whitespace().next() {
                                if let Ok(val) = val_str.parse::<f64>() {
                                    speed = (val * 1_000_000.0) as u64;
                                }
                            }
                        }
                        
                        win_interfaces.push((name.to_string(), description.to_string(), is_up, mac, speed));
                        if is_up && !name.to_lowercase().contains("loopback") {
                            active_connections += 1;
                        }
                    }
                }
            }
            // If parsing as array fails, try as single object
            else if let Ok(iface) = serde_json::from_str::<serde_json::Value>(&output_str) {
                if let (Some(name), Some(status)) = (
                    iface.get("Name").and_then(|v| v.as_str()),
                    iface.get("Status").and_then(|v| v.as_str())
                ) {
                    let is_up = status.to_lowercase() == "up";
                    let description = iface.get("InterfaceDescription")
                        .and_then(|v| v.as_str())
                        .unwrap_or(name);
                    let mac = iface.get("MacAddress")
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string();
                    let speed_str = iface.get("LinkSpeed")
                        .and_then(|v| v.as_str())
                        .unwrap_or("0 bps");
                    
                    // Parse speed
                    let mut speed: u64 = 0;
                    if speed_str.contains("Gbps") {
                        if let Some(val_str) = speed_str.split_whitespace().next() {
                            if let Ok(val) = val_str.parse::<f64>() {
                                speed = (val * 1_000_000_000.0) as u64;
                            }
                        }
                    } else if speed_str.contains("Mbps") {
                        if let Some(val_str) = speed_str.split_whitespace().next() {
                            if let Ok(val) = val_str.parse::<f64>() {
                                speed = (val * 1_000_000.0) as u64;
                            }
                        }
                    }
                    
                    win_interfaces.push((name.to_string(), description.to_string(), is_up, mac, speed));
                    if is_up && !name.to_lowercase().contains("loopback") {
                        active_connections += 1;
                    }
                }
            }
        }
    }
    
    // Get IP addresses
    let ip_output = Command::new("powershell")
        .args(&["-Command", "Get-NetIPAddress | Select-Object InterfaceAlias, IPAddress | ConvertTo-Json"])
        .output();
    
    let mut interface_ips: std::collections::HashMap<String, Vec<String>> = std::collections::HashMap::new();
    if let Ok(output) = ip_output {
        let output_str = String::from_utf8_lossy(&output.stdout).to_string();
        if !output_str.is_empty() {
            // Try to parse as JSON array first
            if let Ok(json) = serde_json::from_str::<Vec<serde_json::Value>>(&output_str) {
                for entry in json {
                    if let (Some(name), Some(ip)) = (
                        entry.get("InterfaceAlias").and_then(|v| v.as_str()),
                        entry.get("IPAddress").and_then(|v| v.as_str())
                    ) {
                        interface_ips.entry(name.to_string())
                            .or_insert_with(Vec::new)
                            .push(ip.to_string());
                    }
                }
            }
            // If parsing as array fails, try as single object
            else if let Ok(entry) = serde_json::from_str::<serde_json::Value>(&output_str) {
                if let (Some(name), Some(ip)) = (
                    entry.get("InterfaceAlias").and_then(|v| v.as_str()),
                    entry.get("IPAddress").and_then(|v| v.as_str())
                ) {
                    interface_ips.entry(name.to_string())
                        .or_insert_with(Vec::new)
                        .push(ip.to_string());
                }
            }
        }
    }
    
    // Combine the information from sysinfo and Windows commands
    for (name, data) in networks.iter() {
        // Find matching Windows interface
        let win_iface = win_interfaces.iter().find(|(win_name, _, _, _, _)| 
            win_name.to_lowercase() == name.to_lowercase()
        );
        
        let (display_name, is_up, mac_address, speed) = if let Some((_, desc, up, mac, spd)) = win_iface {
            (desc.clone(), *up, mac.clone(), *spd)
        } else {
            // Fallback to sysinfo data
            let is_up = data.received() > 0 && !name.to_lowercase().contains("loopback");
            (name.clone(), is_up, data.mac_address().to_string(), 0)
        };
        
        // Get IP addresses
        let ip_addresses = interface_ips.get(name).cloned().unwrap_or_else(Vec::new);
        
        network_interfaces.push(NetworkInterface {
            name: name.clone(),
            display_name,
            bytes_sent: data.total_transmitted(),
            bytes_received: data.total_received(),
            mac_address,
            ip_addresses,
            is_up,
            is_loopback: name.to_lowercase().contains("loopback"),
            speed,
        });
    }
    
    // If we didn't find any interfaces from sysinfo, use the Windows ones
    if network_interfaces.is_empty() {
        for (name, display_name, is_up, mac_address, speed) in win_interfaces {
            let ip_addresses = interface_ips.get(&name).cloned().unwrap_or_else(Vec::new);
            
            network_interfaces.push(NetworkInterface {
                name: name.clone(),
                display_name,
                bytes_sent: 0,
                bytes_received: 0,
                mac_address,
                ip_addresses,
                is_up,
                is_loopback: name.to_lowercase().contains("loopback"),
                speed,
            });
        }
    }
    
    // If we still don't have active connections count, count them from our interfaces
    if active_connections == 0 {
        active_connections = network_interfaces.iter()
            .filter(|iface| iface.is_up && !iface.is_loopback)
            .count();
    }
    
    // Debug log network interfaces
    println!("Network interfaces: {}", network_interfaces.len());
    for iface in &network_interfaces {
        println!("Interface: {}, Display: {}, Up: {}, IPs: {:?}", 
            iface.name, iface.display_name, iface.is_up, iface.ip_addresses);
    }
    println!("Active connections: {}", active_connections);

    let network_info = NetworkInfo {
        interfaces: network_interfaces,
        active_connections,
    };

    // Uptime - Use Windows WMI to get more accurate uptime information
    let mut uptime = System::uptime();
    println!("System uptime from sysinfo: {}", uptime);
    
    // Try to get more accurate uptime using PowerShell with a more reliable format
    let uptime_output = Command::new("powershell")
        .args(&["-Command", "$bootTime = (Get-CimInstance -ClassName Win32_OperatingSystem).LastBootUpTime; $bootTime.ToString('yyyy-MM-dd HH:mm:ss')"])
        .output();
        
    if let Ok(output) = uptime_output {
        let output_str = String::from_utf8_lossy(&output.stdout).to_string().trim().to_string();
        if !output_str.is_empty() {
            // Parse the date string (format is like "2024-07-16 09:30:00")
            // Convert to seconds since boot
            if let Ok(boot_time) = chrono::NaiveDateTime::parse_from_str(&output_str, "%Y-%m-%d %H:%M:%S") {
                let now = chrono::Local::now().naive_local();
                let duration = now.signed_duration_since(boot_time);
                uptime = duration.num_seconds() as u64;
                println!("System uptime from WMI: {}", uptime);
            }
        }
    }
    
    // If we couldn't get uptime from WMI, try using a simpler PowerShell command
    if uptime == 0 {
        // Use a simpler approach - get uptime directly in seconds
        let uptime_output = Command::new("powershell")
            .args(&["-Command", "(Get-Date) - (Get-CimInstance -ClassName Win32_OperatingSystem).LastBootUpTime | Select-Object -ExpandProperty TotalSeconds"])
            .output();
            
        if let Ok(output) = uptime_output {
            let output_str = String::from_utf8_lossy(&output.stdout).to_string().trim().to_string();
            if !output_str.is_empty() {
                // Parse the seconds directly
                if let Ok(seconds) = output_str.parse::<f64>() {
                    uptime = seconds as u64;
                    println!("System uptime from PowerShell TotalSeconds: {}", uptime);
                }
            }
        }
    }
    
    // If we still couldn't get uptime, try using the systeminfo command as a last resort
    if uptime == 0 {
        let uptime_output = Command::new("cmd")
            .args(&["/c", "systeminfo | findstr /C:\"System Up Time\""])
            .output();
            
        if let Ok(output) = uptime_output {
            let output_str = String::from_utf8_lossy(&output.stdout).to_string();
            if !output_str.is_empty() {
                // Parse the uptime string (format is like "System Up Time:            0 Days, 5 Hours, 30 Minutes, 15 Seconds")
                let parts: Vec<&str> = output_str.split(':').collect();
                if parts.len() >= 2 {
                    let time_str = parts[1..].join(":").trim().to_string();
                    
                    // Extract days, hours, minutes, seconds
                    let mut total_seconds = 0u64;
                    
                    if let Some(days_idx) = time_str.find("Days") {
                        if let Some(days_str) = time_str[..days_idx].trim().split_whitespace().last() {
                            if let Ok(days) = days_str.parse::<u64>() {
                                total_seconds += days * 86400; // days to seconds
                            }
                        }
                    }
                    
                    if let Some(hours_idx) = time_str.find("Hours") {
                        if let Some(hours_str) = time_str[..hours_idx].trim().split_whitespace().last() {
                            if let Ok(hours) = hours_str.parse::<u64>() {
                                total_seconds += hours * 3600; // hours to seconds
                            }
                        }
                    }
                    
                    if let Some(mins_idx) = time_str.find("Minutes") {
                        if let Some(mins_str) = time_str[..mins_idx].trim().split_whitespace().last() {
                            if let Ok(mins) = mins_str.parse::<u64>() {
                                total_seconds += mins * 60; // minutes to seconds
                            }
                        }
                    }
                    
                    if let Some(secs_idx) = time_str.find("Seconds") {
                        if let Some(secs_str) = time_str[..secs_idx].trim().split_whitespace().last() {
                            if let Ok(secs) = secs_str.parse::<u64>() {
                                total_seconds += secs;
                            }
                        }
                    }
                    
                    if total_seconds > 0 {
                        uptime = total_seconds;
                        println!("System uptime from systeminfo: {}", uptime);
                    }
                }
            }
        }
    }
    
    // Ensure uptime is never zero or negative
    if uptime <= 0 {
        uptime = 60; // Default to 1 minute if we can't get a valid uptime
    }
    
    println!("Final system uptime: {}", uptime);

    Ok(SystemInfo {
        os: os_info,
        hardware: hardware_info,
        disk: disk_info,
        network: network_info,
        uptime,
    })
}

#[command]
pub fn open_in_explorer(path: String) -> Result<(), String> {
    Command::new("explorer")
        .arg(path)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}
#[
command]
pub fn get_computer_name() -> Result<String, String> {
    use std::process::Command;
    use std::os::windows::process::CommandExt;
    
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    
    // 使用PowerShell获取计算机名
    let output = Command::new("powershell")
        .args(&["-Command", "$env:COMPUTERNAME"])
        .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
        .output()
        .map_err(|e| format!("获取计算机名失败: {}", e))?;
    
    let hostname = String::from_utf8_lossy(&output.stdout).to_string().trim().to_string();
    
    if hostname.is_empty() {
        Err("无法获取计算机名".to_string())
    } else {
        Ok(hostname)
    }
}