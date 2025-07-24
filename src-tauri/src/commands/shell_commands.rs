use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemDashboardInfo {
    pub cpu_info: String,
    pub memory_info: String,
    pub disk_info: String,
    pub gpu_info: String,
    pub network_info: String,
    pub os_info: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResult {
    pub stdout: String,
    pub stderr: String,
    pub success: bool,
}

#[tauri::command]
pub async fn run_command(command: String, args: Vec<String>) -> Result<String, String> {
    // 在Windows上执行命令，处理编码问题
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        
        // 使用chcp 65001设置UTF-8编码，然后执行命令
        let mut full_args = vec!["/c", "chcp", "65001", ">nul", "&&"];
        full_args.push(&command);
        for arg in &args {
            full_args.push(arg);
        }
        
        // 使用CREATE_NO_WINDOW标志来隐藏命令提示符窗口
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        let output = Command::new("cmd")
            .args(&full_args)
            .creation_flags(CREATE_NO_WINDOW) // 添加这个标志来隐藏窗口
            .output()
            .map_err(|e| format!("执行命令失败: {}", e))?;
        
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        
        if output.status.success() {
            Ok(stdout)
        } else {
            Err(format!("命令执行失败: {}", stderr))
        }
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        let output = Command::new(command.clone())
            .args(&args)
            .output()
            .map_err(|e| format!("执行命令失败: {}", e))?;
        
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        
        if output.status.success() {
            Ok(stdout)
        } else {
            Err(format!("命令执行失败: {}", stderr))
        }
    }
}

#[tauri::command]
pub async fn open_system_settings() -> Result<(), String> {
    open_with_default_app("ms-settings:")
}

#[tauri::command]
pub async fn open_network_settings() -> Result<(), String> {
    open_with_default_app("ms-settings:network")
}

#[tauri::command]
pub async fn open_task_manager() -> Result<(), String> {
    // 使用cmd /c start方式打开任务管理器
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        Command::new("cmd")
            .args(&["/c", "start", "taskmgr"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .spawn()
            .map_err(|e| format!("无法打开任务管理器: {}", e))?;
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        Command::new("cmd")
            .args(&["/c", "start", "taskmgr"])
            .spawn()
            .map_err(|e| format!("无法打开任务管理器: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn open_device_manager() -> Result<(), String> {
    // 使用cmd /c start方式打开设备管理器
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        Command::new("cmd")
            .args(&["/c", "start", "devmgmt.msc"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .spawn()
            .map_err(|e| format!("无法打开设备管理器: {}", e))?;
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        Command::new("cmd")
            .args(&["/c", "start", "devmgmt.msc"])
            .spawn()
            .map_err(|e| format!("无法打开设备管理器: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn open_system_info() -> Result<(), String> {
    // 使用cmd /c start方式打开系统信息
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        Command::new("cmd")
            .args(&["/c", "start", "msinfo32"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .spawn()
            .map_err(|e| format!("无法打开系统信息: {}", e))?;
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        Command::new("cmd")
            .args(&["/c", "start", "msinfo32"])
            .spawn()
            .map_err(|e| format!("无法打开系统信息: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn restart_explorer() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        // 终止explorer进程
        let kill_result = Command::new("taskkill")
            .args(&["/f", "/im", "explorer.exe"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .map_err(|e| format!("无法终止资源管理器: {}", e))?;
        
        if !kill_result.status.success() {
            return Err("无法终止资源管理器进程".to_string());
        }
        
        // 重新启动explorer进程
        Command::new("cmd")
            .args(&["/c", "start", "explorer"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .spawn()
            .map_err(|e| format!("无法重启资源管理器: {}", e))?;
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        return Err("此功能仅支持Windows系统".to_string());
    }
    
    Ok(())
}

#[tauri::command]
pub async fn clean_temp_files() -> Result<(), String> {
    // 打开临时文件夹
    open_with_default_app("%temp%")
}

#[tauri::command]
pub async fn run_command_in_new_window(command: String, args: Vec<String>) -> Result<(), String> {
    // 在新窗口中执行命令
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        // 构建完整命令字符串
        let full_command = format!("{} {}", command, args.join(" "));
        println!("在新窗口中执行命令: {}", full_command);
        
        // 使用cmd /c start cmd /k方式打开新窗口
        // 注意：这里不使用CREATE_NO_WINDOW标志，因为我们希望显示新的命令窗口
        Command::new("cmd")
            .args(&["/c", "start", "cmd", "/k", &full_command])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏初始命令窗口，但新窗口会显示
            .spawn()
            .map_err(|e| format!("无法在新窗口中执行命令: {}", e))?;
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        return Err("此功能仅支持Windows系统".to_string());
    }
    
    Ok(())
}

#[tauri::command]
pub async fn open_gui_app(app_name: String) -> Result<(), String> {
    // 直接打开GUI应用，不显示命令窗口
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        println!("打开GUI应用: {}", app_name);
        
        // 使用cmd /c start方式打开，不显示命令窗口
        Command::new("cmd")
            .args(&["/c", "start", "", &app_name])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .spawn()
            .map_err(|e| format!("无法打开应用 {}: {}", app_name, e))?;
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        return Err("此功能仅支持Windows系统".to_string());
    }
    
    Ok(())
}

#[tauri::command]
pub async fn open_windows_security() -> Result<(), String> {
    // 打开Windows安全中心
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        // 尝试多种方式打开Windows安全中心
        
        // 方式1: 使用ms-settings协议
        let result1 = Command::new("cmd")
            .args(&["/c", "start", "ms-settings:windowsdefender"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .spawn();
            
        if result1.is_ok() {
            return Ok(());
        }
        
        // 方式2: 使用windowsdefender协议
        let result2 = Command::new("cmd")
            .args(&["/c", "start", "windowsdefender:"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .spawn();
            
        if result2.is_ok() {
            return Ok(());
        }
        
        // 方式3: 直接运行Windows Security应用
        let result3 = Command::new("cmd")
            .args(&["/c", "start", "ms-settings:privacy-general"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .spawn();
            
        if result3.is_ok() {
            return Ok(());
        }
        
        Err("无法打开Windows安全中心".to_string())
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        Err("此功能仅支持Windows系统".to_string())
    }
}

#[tauri::command]
pub async fn get_system_dashboard_info() -> Result<SystemDashboardInfo, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        // 获取CPU信息 - 使用UTF-8编码
        let cpu_output = Command::new("cmd")
            .args(&["/c", "chcp", "65001", ">nul", "&&", "wmic", "cpu", "get", "name,maxclockspeed,numberofcores,numberoflogicalprocessors", "/format:list"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .map_err(|e| format!("获取CPU信息失败: {}", e))?;
        let cpu_info = String::from_utf8_lossy(&cpu_output.stdout).to_string();

        // 获取内存信息 - 使用PowerShell命令代替wmic
        let memory_output = Command::new("powershell")
            .args(&["-Command", "(Get-CimInstance -ClassName Win32_ComputerSystem).TotalPhysicalMemory / 1GB"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .map_err(|e| format!("获取内存信息失败: {}", e))?;
        let memory_gb = String::from_utf8_lossy(&memory_output.stdout).to_string().trim().to_string();
        let memory_info = format!("{} GB", memory_gb);

        // 获取磁盘信息 - 使用PowerShell命令代替wmic
        let disk_output = Command::new("powershell")
            .args(&["-Command", "Get-CimInstance -ClassName Win32_LogicalDisk | ForEach-Object { $_.Caption + ' ' + [math]::Round($_.Size / 1GB, 1).ToString() + 'GB (可用 ' + [math]::Round($_.FreeSpace / 1GB, 1).ToString() + 'GB)' }"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .map_err(|e| format!("获取磁盘信息失败: {}", e))?;
        let disk_info = String::from_utf8_lossy(&disk_output.stdout).to_string();

        // 获取显卡信息 - 使用PowerShell的Get-CimInstance命令，并直接格式化输出
        let gpu_output = Command::new("powershell")
            .args(&["-Command", "Get-CimInstance -ClassName Win32_VideoController | ForEach-Object { $ram = if ($_.AdapterRAM) { [math]::Round($_.AdapterRAM / 1GB, 1).ToString() + ' GB' } else { 'Unknown' }; $_.Name + ' (' + $ram + ')' }"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .map_err(|e| format!("获取显卡信息失败: {}", e))?;
        let mut gpu_info = String::from_utf8_lossy(&gpu_output.stdout).to_string();
        
        // 如果PowerShell命令没有返回有效信息，尝试使用wmic命令
        if gpu_info.trim().is_empty() {
            println!("PowerShell未返回有效的显卡信息，尝试使用WMIC...");
            let wmic_output = Command::new("cmd")
                .args(&["/c", "chcp", "65001", ">nul", "&&", "wmic", "path", "win32_VideoController", "get", "name,adapterram,driverversion", "/format:list"])
                .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
                .output()
                .map_err(|e| format!("使用WMIC获取显卡信息失败: {}", e))?;
            gpu_info = String::from_utf8_lossy(&wmic_output.stdout).to_string();
        }
        
        // 如果仍然没有返回有效信息，尝试使用dxdiag
        if gpu_info.trim().is_empty() || (!gpu_info.contains("Name") && !gpu_info.contains("AdapterRAM")) {
            println!("PowerShell和WMIC未返回有效的显卡信息，尝试使用dxdiag...");
            // 创建临时文件保存dxdiag输出
            let temp_file = std::env::temp_dir().join("dxdiag_output.txt");
            let temp_path = temp_file.to_string_lossy().to_string();
            
            // 运行dxdiag并将输出保存到文件
            Command::new("cmd")
                .args(&["/c", "dxdiag", "/t", &temp_path])
                .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
                .output()
                .map_err(|e| format!("运行dxdiag失败: {}", e))?;
                
            // 等待文件生成，增加等待时间
            println!("等待dxdiag生成输出文件: {}", temp_path);
            std::thread::sleep(std::time::Duration::from_secs(5));
            
            // 读取文件内容
            if let Ok(content) = std::fs::read_to_string(&temp_file) {
                // 解析dxdiag输出中的显卡信息
                let mut gpu_names = Vec::new();
                let mut gpu_memory = Vec::new();
                
                for line in content.lines() {
                    if line.contains("Card name:") {
                        if let Some(name) = line.split(':').nth(1) {
                            gpu_names.push(name.trim().to_string());
                        }
                    }
                    if line.contains("Dedicated Memory:") {
                        if let Some(memory) = line.split(':').nth(1) {
                            gpu_memory.push(memory.trim().to_string());
                        }
                    }
                }
                
                // 构建GPU信息字符串
                let mut gpu_info_parts = Vec::new();
                for (i, name) in gpu_names.iter().enumerate() {
                    let memory = if i < gpu_memory.len() {
                        gpu_memory[i].clone()
                    } else {
                        "Unknown".to_string()
                    };
                    gpu_info_parts.push(format!("{} ({})", name, memory));
                }
                
                gpu_info = gpu_info_parts.join(", ");
                
                // 如果仍然没有找到GPU信息，使用默认值
                if gpu_info.is_empty() {
                    gpu_info = "Unknown GPU".to_string();
                }
            } else {
                gpu_info = "Unknown GPU".to_string();
            }
            
            // 清理临时文件
            let _ = std::fs::remove_file(temp_file);
        }
        
        // 解析PowerShell或WMIC输出
        if !gpu_info.contains("Unknown GPU") {
            // 使用更精确的解析方法
            let mut gpu_info_parts = Vec::new();
            let mut current_name = String::new();
            let mut current_ram = String::new();
            let mut _current_processor = String::new(); // 使用下划线前缀表示有意未使用
            let mut in_new_gpu = false;
            
            for line in gpu_info.lines() {
                let line = line.trim();
                
                // 检测新的GPU记录
                if line.starts_with("Name") || line.starts_with("Caption") {
                    // 如果已经有GPU信息，保存它
                    if !current_name.is_empty() && (current_ram.is_empty() || !current_name.to_lowercase().contains("virtual")) {
                        let ram_info = if !current_ram.is_empty() {
                            format!(" ({})", current_ram)
                        } else {
                            String::new()
                        };
                        gpu_info_parts.push(format!("{}{}", current_name, ram_info));
                    }
                    
                    // 开始新的GPU记录
                    let parts: Vec<&str> = line.splitn(2, ':').collect();
                    if parts.len() > 1 {
                        current_name = parts[1].trim().to_string();
                        current_ram = String::new();
                        _current_processor = String::new();
                        in_new_gpu = true;
                    }
                } 
                // 解析AdapterRAM
                else if (line.starts_with("AdapterRAM") || line.contains("Adapter RAM")) && in_new_gpu {
                    let parts: Vec<&str> = line.splitn(2, ':').collect();
                    if parts.len() > 1 {
                        let ram_str = parts[1].trim();
                        if let Ok(ram) = ram_str.parse::<u64>() {
                            let gb = ram as f64 / (1024.0 * 1024.0 * 1024.0);
                            current_ram = format!("{:.1} GB", gb);
                        }
                    }
                }
                // 解析VideoProcessor
                else if line.starts_with("VideoProcessor") && in_new_gpu {
                    let parts: Vec<&str> = line.splitn(2, ':').collect();
                    if parts.len() > 1 {
                        _current_processor = parts[1].trim().to_string();
                    }
                }
                // 空行表示一个GPU记录结束
                else if line.is_empty() && in_new_gpu {
                    in_new_gpu = false;
                }
            }
            
            // 处理最后一个GPU
            if !current_name.is_empty() && (current_ram.is_empty() || !current_name.to_lowercase().contains("virtual")) {
                let ram_info = if !current_ram.is_empty() {
                    format!(" ({})", current_ram)
                } else {
                    String::new()
                };
                gpu_info_parts.push(format!("{}{}", current_name, ram_info));
            }
            
            // 创建一个副本用于过滤
            let gpu_info_parts_clone = gpu_info_parts.clone();
            
            // 过滤掉虚拟显卡
            let real_gpus: Vec<String> = gpu_info_parts_clone.into_iter()
                .filter(|gpu| {
                    let gpu_lower = gpu.to_lowercase();
                    !gpu_lower.contains("virtual") && 
                    !gpu_lower.contains("remote") && 
                    !gpu_lower.contains("basic display") &&
                    !gpu_lower.contains("microsoft basic display")
                })
                .collect();
            
            // 更新GPU信息字符串
            if !real_gpus.is_empty() {
                gpu_info = real_gpus.join(", ");
            } else {
                // 如果过滤后没有真实显卡，使用所有显卡信息
                gpu_info = gpu_info_parts.join(", ");
            }
            
            // 如果仍然没有GPU信息，使用默认值
            if gpu_info.is_empty() {
                gpu_info = "Unknown GPU".to_string();
            }
        }

        // 获取网络信息 - 使用PowerShell命令代替wmic
        let network_output = Command::new("powershell")
            .args(&["-Command", "Get-CimInstance -ClassName Win32_NetworkAdapter | Where-Object { $_.NetConnectionStatus -eq 2 } | Select-Object -ExpandProperty Name"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .map_err(|e| format!("获取网络信息失败: {}", e))?;
        let network_info = String::from_utf8_lossy(&network_output.stdout).to_string();

        // 获取操作系统信息 - 使用PowerShell命令代替wmic
        let os_output = Command::new("powershell")
            .args(&["-Command", "$os = Get-CimInstance -ClassName Win32_OperatingSystem; $os.Caption + ' (Build ' + $os.BuildNumber + ')'"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .map_err(|e| format!("获取操作系统信息失败: {}", e))?;
        let os_info = String::from_utf8_lossy(&os_output.stdout).to_string();

        Ok(SystemDashboardInfo {
            cpu_info: parse_cpu_info(&cpu_info),
            memory_info: parse_memory_info(&memory_info),
            disk_info: parse_disk_info(&disk_info),
            gpu_info: parse_gpu_info(&gpu_info),
            network_info: parse_network_info(&network_info),
            os_info: parse_os_info(&os_info),
        })
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("此功能仅支持Windows系统".to_string())
    }
}

fn parse_cpu_info(raw: &str) -> String {
    let lines: Vec<&str> = raw.lines().collect();
    let mut name = String::new();
    let mut cores = String::new();
    let mut logical_processors = String::new();
    let mut speed = String::new();

    for line in lines {
        if line.starts_with("Name=") {
            name = line.replace("Name=", "").trim().to_string();
        } else if line.starts_with("NumberOfCores=") {
            cores = line.replace("NumberOfCores=", "").trim().to_string();
        } else if line.starts_with("NumberOfLogicalProcessors=") {
            logical_processors = line.replace("NumberOfLogicalProcessors=", "").trim().to_string();
        } else if line.starts_with("MaxClockSpeed=") {
            let speed_mhz = line.replace("MaxClockSpeed=", "").trim().to_string();
            if let Ok(mhz) = speed_mhz.parse::<f64>() {
                speed = format!("{:.1} GHz", mhz / 1000.0);
            }
        }
    }

    // 如果有逻辑处理器信息，显示核心数和线程数
    if !cores.is_empty() && !logical_processors.is_empty() {
        format!("{} ({} 核心 {} 线程, {})", name, cores, logical_processors, speed)
    } else if !cores.is_empty() {
        format!("{} ({} 核心, {})", name, cores, speed)
    } else {
        format!("{} ({})", name, speed)
    }
}

fn parse_memory_info(raw: &str) -> String {
    // 新的内存信息格式已经是"X.X GB"，直接返回
    if raw.contains("GB") {
        return raw.trim().to_string();
    }
    
    // 尝试解析为数字（可能是PowerShell直接返回的GB值）
    if let Ok(gb) = raw.trim().parse::<f64>() {
        return format!("{:.1} GB", gb);
    }
    
    // 旧格式解析（兼容性保留）
    for line in raw.lines() {
        if line.starts_with("TotalPhysicalMemory=") {
            let memory_bytes = line.replace("TotalPhysicalMemory=", "").trim().to_string();
            if let Ok(bytes) = memory_bytes.parse::<u64>() {
                let gb = bytes as f64 / (1024.0 * 1024.0 * 1024.0);
                return format!("{:.1} GB", gb);
            }
        }
    }
    
    "未知".to_string()
}

fn parse_disk_info(raw: &str) -> String {
    let lines: Vec<&str> = raw.lines().collect();
    let mut disks = Vec::new();
    let mut current_disk = (String::new(), 0u64, 0u64); // (caption, size, freespace)

    for line in lines {
        if line.starts_with("Caption=") {
            current_disk.0 = line.replace("Caption=", "").trim().to_string();
        } else if line.starts_with("Size=") {
            if let Ok(size) = line.replace("Size=", "").trim().parse::<u64>() {
                current_disk.1 = size;
            }
        } else if line.starts_with("FreeSpace=") {
            if let Ok(free) = line.replace("FreeSpace=", "").trim().parse::<u64>() {
                current_disk.2 = free;
                if !current_disk.0.is_empty() && current_disk.1 > 0 {
                    let total_gb = current_disk.1 as f64 / (1024.0 * 1024.0 * 1024.0);
                    let free_gb = current_disk.2 as f64 / (1024.0 * 1024.0 * 1024.0);
                    disks.push(format!("{} {:.1}GB (可用 {:.1}GB)", current_disk.0, total_gb, free_gb));
                }
                current_disk = (String::new(), 0, 0);
            }
        }
    }

    if disks.is_empty() {
        "未知".to_string()
    } else {
        disks.join(", ")
    }
}

fn parse_gpu_info(raw: &str) -> String {
    let lines: Vec<&str> = raw.lines().collect();
    let mut gpus = Vec::new();
    let mut current_gpu = (String::new(), String::new(), String::new()); // (name, ram, driver)

    for line in lines {
        let line = line.trim();
        if line.is_empty() {
            // 空行表示一个GPU记录结束
            if !current_gpu.0.is_empty() {
                let gpu_info = if !current_gpu.1.is_empty() {
                    format!("{} ({})", current_gpu.0, current_gpu.1)
                } else {
                    current_gpu.0.clone()
                };
                gpus.push(gpu_info);
                current_gpu = (String::new(), String::new(), String::new());
            }
        } else if line.starts_with("Name=") {
            current_gpu.0 = line.replace("Name=", "").trim().to_string();
        } else if line.starts_with("AdapterRAM=") {
            let ram_bytes = line.replace("AdapterRAM=", "").trim().to_string();
            if let Ok(bytes) = ram_bytes.parse::<u64>() {
                if bytes > 0 {
                    let gb = bytes as f64 / (1024.0 * 1024.0 * 1024.0);
                    current_gpu.1 = format!("{:.1}GB", gb);
                }
            }
        } else if line.starts_with("DriverVersion=") {
            current_gpu.2 = line.replace("DriverVersion=", "").trim().to_string();
        }
    }

    // 处理最后一个GPU（如果没有空行结尾）
    if !current_gpu.0.is_empty() {
        let gpu_info = if !current_gpu.1.is_empty() {
            format!("{} ({})", current_gpu.0, current_gpu.1)
        } else {
            current_gpu.0.clone()
        };
        gpus.push(gpu_info);
    }

    if gpus.is_empty() {
        "未知".to_string()
    } else {
        gpus.join(", ")
    }
}

fn parse_network_info(raw: &str) -> String {
    let lines: Vec<&str> = raw.lines().collect();
    let mut adapters = Vec::new();

    for line in lines {
        if line.starts_with("Name=") {
            let adapter_name = line.replace("Name=", "").trim().to_string();
            if !adapter_name.is_empty() && !adapter_name.contains("Loopback") {
                adapters.push(adapter_name);
            }
        }
    }

    if adapters.is_empty() {
        "未知".to_string()
    } else {
        adapters.join(", ")
    }
}

fn parse_os_info(raw: &str) -> String {
    let lines: Vec<&str> = raw.lines().collect();
    let mut caption = String::new();
    let mut version = String::new();
    let mut build = String::new();

    for line in lines {
        if line.starts_with("Caption=") {
            caption = line.replace("Caption=", "").trim().to_string();
        } else if line.starts_with("Version=") {
            version = line.replace("Version=", "").trim().to_string();
        } else if line.starts_with("BuildNumber=") {
            build = line.replace("BuildNumber=", "").trim().to_string();
        }
    }

    if !caption.is_empty() {
        if !build.is_empty() {
            format!("{} (Build {})", caption, build)
        } else if !version.is_empty() {
            format!("{} ({})", caption, version)
        } else {
            caption
        }
    } else {
        "未知".to_string()
    }
}

fn open_with_default_app(path: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        Command::new("cmd")
            .args(&["/c", "start", "", path])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .spawn()
            .map_err(|e| format!("无法打开路径 {}: {}", path, e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("无法打开路径 {}: {}", path, e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("无法打开路径 {}: {}", path, e))?;
    }
    
    Ok(())
}
#[derive
(Debug, Serialize, Deserialize)]
pub struct DetailedSystemInfo {
    pub os_info: serde_json::Value,
    pub cpu_info: serde_json::Value,
    pub memory_info: serde_json::Value,
    pub gpu_info: Vec<serde_json::Value>,
    pub network_info: Vec<serde_json::Value>,
    pub disk_info: Vec<serde_json::Value>,
    pub hostname: String,
    pub active_connections: u32,
}

#[tauri::command]
pub async fn get_system_info_detailed() -> Result<DetailedSystemInfo, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        let mut result = DetailedSystemInfo {
            os_info: serde_json::Value::Null,
            cpu_info: serde_json::Value::Null,
            memory_info: serde_json::Value::Null,
            gpu_info: Vec::new(),
            network_info: Vec::new(),
            disk_info: Vec::new(),
            hostname: String::new(),
            active_connections: 0,
        };

        // 获取操作系统信息 - 使用UTF-8编码
        if let Ok(output) = Command::new("cmd")
            .args(&["/c", "chcp", "65001", ">nul", "&&", "powershell", "-Command", "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber, OSArchitecture | ConvertTo-Json"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
        {
            let output_str = String::from_utf8_lossy(&output.stdout).to_string();
            if !output_str.trim().is_empty() {
                if let Ok(json) = serde_json::from_str(&output_str) {
                    result.os_info = json;
                }
            }
        }

        // 获取主机名
        if let Ok(output) = Command::new("powershell")
            .args(&["-Command", "$env:COMPUTERNAME"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
        {
            result.hostname = String::from_utf8_lossy(&output.stdout).trim().to_string();
        }

        // 获取CPU信息
        if let Ok(output) = Command::new("powershell")
            .args(&["-Command", "Get-CimInstance -ClassName Win32_Processor | Select-Object Name, NumberOfCores, MaxClockSpeed | ConvertTo-Json"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
        {
            let output_str = String::from_utf8_lossy(&output.stdout).to_string();
            if !output_str.trim().is_empty() {
                if let Ok(json) = serde_json::from_str(&output_str) {
                    result.cpu_info = json;
                }
            }
        }

        // 获取内存信息
        if let Ok(output) = Command::new("powershell")
            .args(&["-Command", "Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory | ConvertTo-Json"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
        {
            let output_str = String::from_utf8_lossy(&output.stdout).to_string();
            if !output_str.trim().is_empty() {
                if let Ok(json) = serde_json::from_str(&output_str) {
                    result.memory_info = json;
                }
            }
        }

        // 获取GPU信息 - 先尝试NVIDIA-SMI获取详细信息
        let mut gpu_info_collected = false;
        
        // 尝试使用NVIDIA-SMI获取NVIDIA显卡信息
        if let Ok(output) = Command::new("powershell")
            .args(&["-Command", "nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu --format=csv,noheader,nounits"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
        {
            let output_str = String::from_utf8_lossy(&output.stdout).to_string();
            if !output_str.trim().is_empty() && !output_str.contains("not found") {
                let lines = output_str.trim().split('\n');
                for line in lines {
                    let parts: Vec<&str> = line.split(',').map(|s| s.trim()).collect();
                    if parts.len() >= 6 {
                        let mut gpu_obj = serde_json::Map::new();
                        gpu_obj.insert("Name".to_string(), serde_json::Value::String(parts[0].to_string()));
                        gpu_obj.insert("TotalMemoryMB".to_string(), serde_json::Value::String(parts[1].to_string()));
                        gpu_obj.insert("UsedMemoryMB".to_string(), serde_json::Value::String(parts[2].to_string()));
                        gpu_obj.insert("FreeMemoryMB".to_string(), serde_json::Value::String(parts[3].to_string()));
                        gpu_obj.insert("Utilization".to_string(), serde_json::Value::String(parts[4].to_string()));
                        gpu_obj.insert("Temperature".to_string(), serde_json::Value::String(parts[5].to_string()));
                        gpu_obj.insert("Vendor".to_string(), serde_json::Value::String("NVIDIA".to_string()));
                        result.gpu_info.push(serde_json::Value::Object(gpu_obj));
                        gpu_info_collected = true;
                    }
                }
            }
        }
        
        // 如果没有NVIDIA显卡或NVIDIA-SMI不可用，使用WMI获取基本GPU信息
        if !gpu_info_collected {
            if let Ok(output) = Command::new("powershell")
                .args(&["-Command", "Get-CimInstance -ClassName Win32_VideoController | Where-Object {$_.Name -notlike '*Basic Display*' -and $_.Name -notlike '*Remote*'} | Select-Object Name, AdapterRAM, VideoProcessor, DriverVersion | ConvertTo-Json -Depth 1"])
                .creation_flags(CREATE_NO_WINDOW)
                .output()
            {
                let output_str = String::from_utf8_lossy(&output.stdout).to_string();
                if !output_str.trim().is_empty() {
                    if let Ok(json_array) = serde_json::from_str::<Vec<serde_json::Value>>(&output_str) {
                        result.gpu_info = json_array;
                    } else if let Ok(json_obj) = serde_json::from_str::<serde_json::Value>(&output_str) {
                        result.gpu_info = vec![json_obj];
                    }
                }
            }
        }

        // 获取网络接口信息
        if let Ok(output) = Command::new("powershell")
            .args(&["-Command", "Get-NetAdapter | Where-Object Status -eq 'Up' | Select-Object Name, InterfaceDescription, MacAddress, LinkSpeed | ConvertTo-Json"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
        {
            let output_str = String::from_utf8_lossy(&output.stdout).to_string();
            if !output_str.trim().is_empty() {
                if let Ok(json_array) = serde_json::from_str::<Vec<serde_json::Value>>(&output_str) {
                    result.network_info = json_array;
                } else if let Ok(json_obj) = serde_json::from_str::<serde_json::Value>(&output_str) {
                    result.network_info = vec![json_obj];
                }
            }
        }

        // 获取活动连接数
        if let Ok(output) = Command::new("powershell")
            .args(&["-Command", "(Get-NetTCPConnection -State Established).Count"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
        {
            let output_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if let Ok(count) = output_str.parse::<u32>() {
                result.active_connections = count;
            }
        }

        // 获取磁盘信息
        if let Ok(output) = Command::new("powershell")
            .args(&["-Command", "Get-Volume | Where-Object {$_.DriveLetter -ne $null} | Select-Object DriveLetter, FileSystemLabel, FileSystem, Size, SizeRemaining | ConvertTo-Json"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
        {
            let output_str = String::from_utf8_lossy(&output.stdout).to_string();
            if !output_str.trim().is_empty() {
                if let Ok(json_array) = serde_json::from_str::<Vec<serde_json::Value>>(&output_str) {
                    result.disk_info = json_array;
                } else if let Ok(json_obj) = serde_json::from_str::<serde_json::Value>(&output_str) {
                    result.disk_info = vec![json_obj];
                }
            }
        }

        Ok(result)
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("此功能仅支持Windows系统".to_string())
    }
}