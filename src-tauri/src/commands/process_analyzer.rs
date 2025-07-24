use serde::{Deserialize, Serialize};
use sysinfo::{System, Pid, Signal, ProcessRefreshKind, RefreshKind};
use crate::utils::process_utils;

#[derive(Debug, Serialize, Deserialize)]
pub struct DetailedProcessInfo {
    pub pid: u32,
    pub name: String,
    pub exe_path: Option<String>,
    pub cmd: Vec<String>,
    pub cpu_usage: f32,
    pub memory_usage: u64,
    pub status: String,
    pub start_time: u64,
}

#[tauri::command]
pub async fn get_process_info(pid: u32) -> Result<Option<DetailedProcessInfo>, String> {
    let mut system = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::everything())
    );
    system.refresh_processes();

    if let Some(process) = system.process(Pid::from(pid as usize)) {
        Ok(Some(DetailedProcessInfo {
            pid,
            name: process.name().to_string(),
            exe_path: process.exe().map(|path| path.to_string_lossy().to_string()),
            cmd: process.cmd().to_vec(),
            cpu_usage: process.cpu_usage(),
            memory_usage: process.memory(),
            status: format!("{:?}", process.status()),
            start_time: process.start_time(),
        }))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn get_all_processes() -> Result<Vec<DetailedProcessInfo>, String> {
    let mut system = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::everything())
    );
    system.refresh_processes();
    
    let mut processes = Vec::new();
    
    for (pid, process) in system.processes() {
        processes.push(DetailedProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string(),
            exe_path: process.exe().map(|path| path.to_string_lossy().to_string()),
            cmd: process.cmd().to_vec(),
            cpu_usage: process.cpu_usage(),
            memory_usage: process.memory(),
            status: format!("{:?}", process.status()),
            start_time: process.start_time(),
        });
    }
    
    // 按CPU使用率排序
    processes.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap_or(std::cmp::Ordering::Equal));
    
    // 限制返回的进程数量，避免数据过大
    if processes.len() > 100 {
        processes.truncate(100);
    }
    
    Ok(processes)
}

#[tauri::command]
pub async fn kill_process(pid: u32) -> Result<bool, String> {
    let mut system = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::everything())
    );
    system.refresh_processes();

    if let Some(process) = system.process(Pid::from(pid as usize)) {
        // 检查是否是系统关键进程
        if process_utils::is_system_process(process.name()) {
            return Err(format!("{}是系统关键进程，终止可能导致系统不稳定", process.name()));
        }
        
        Ok(process.kill_with(Signal::Term).unwrap_or(false))
    } else {
        Err("进程不存在".to_string())
    }
}

#[tauri::command]
pub async fn get_process_by_port(port: u16) -> Result<Option<DetailedProcessInfo>, String> {
    // 获取所有端口信息
    let ports = crate::commands::port_monitor::get_all_ports().await?;
    
    // 查找指定端口
    if let Some(port_info) = ports.into_iter().find(|p| p.port == port) {
        // 获取进程详细信息
        get_process_info(port_info.process.pid).await
    } else {
        Ok(None)
    }
}
