use sysinfo::{System, ProcessRefreshKind, RefreshKind};
use std::collections::HashMap;

pub fn get_process_name_map() -> HashMap<u32, String> {
    let mut system = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::everything())
    );
    system.refresh_processes();
    
    let mut map = HashMap::new();
    for (pid, process) in system.processes() {
        map.insert(pid.as_u32(), process.name().to_string());
    }
    
    map
}

pub fn get_friendly_process_name(process_name: &str) -> String {
    match process_name {
        "chrome.exe" => "Google Chrome浏览器".to_string(),
        "firefox.exe" => "Mozilla Firefox浏览器".to_string(),
        "msedge.exe" => "Microsoft Edge浏览器".to_string(),
        "node.exe" => "Node.js".to_string(),
        "java.exe" => "Java应用".to_string(),
        "python.exe" => "Python应用".to_string(),
        "mysqld.exe" => "MySQL数据库".to_string(),
        "postgres.exe" => "PostgreSQL数据库".to_string(),
        "mongod.exe" => "MongoDB数据库".to_string(),
        "docker.exe" => "Docker引擎".to_string(),
        "docker-proxy.exe" => "Docker容器".to_string(),
        "svchost.exe" => "Windows系统服务".to_string(),
        "System" => "Windows系统".to_string(),
        "WINWORD.EXE" => "Microsoft Word".to_string(),
        "EXCEL.EXE" => "Microsoft Excel".to_string(),
        "POWERPNT.EXE" => "Microsoft PowerPoint".to_string(),
        "AcroRd32.exe" => "Adobe Acrobat Reader".to_string(),
        "explorer.exe" => "Windows资源管理器".to_string(),
        "vlc.exe" => "VLC媒体播放器".to_string(),
        _ => process_name.to_string(),
    }
}

pub fn is_system_process(process_name: &str) -> bool {
    let system_processes = [
        "svchost.exe",
        "System",
        "smss.exe",
        "csrss.exe",
        "wininit.exe",
        "services.exe",
        "lsass.exe",
        "winlogon.exe",
        "spoolsv.exe",
        "explorer.exe",
        "dwm.exe",
        "taskhost.exe",
        "taskhostw.exe",
        "RuntimeBroker.exe",
        "ShellExperienceHost.exe",
        "SearchUI.exe",
        "sihost.exe",
        "ctfmon.exe",
        "conhost.exe",
        "dllhost.exe",
        "fontdrvhost.exe",
        "Registry",
        "Idle",
        "Secure System",
        "Memory Compression",
    ];
    
    system_processes.contains(&process_name)
}