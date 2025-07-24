use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct DockerContainer {
    pub id: String,
    pub name: String,
    pub image: String,
    pub status: String,
    pub ports: Vec<DockerPort>,
    pub created: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DockerPort {
    pub container_port: u16,
    pub host_port: u16,
    pub protocol: String,
}

pub struct DockerMonitor;

impl DockerMonitor {
    pub fn new() -> Self {
        DockerMonitor
    }
    
    pub fn is_docker_available(&self) -> bool {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        let output = Command::new("docker")
            .args(["--version"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output();
            
        output.is_ok()
    }
    
    pub fn get_containers(&self) -> Result<Vec<DockerContainer>, String> {
        if !self.is_docker_available() {
            return Err("Docker未安装或无法访问".to_string());
        }
        
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        // 获取容器列表
        let output = Command::new("docker")
            .args(["ps", "-a", "--format", "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}|{{.CreatedAt}}"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .map_err(|e| format!("执行Docker命令失败: {}", e))?;
            
        let output_str = String::from_utf8_lossy(&output.stdout);
        
        let mut containers = Vec::new();
        
        for line in output_str.lines() {
            if line.is_empty() {
                continue;
            }
            
            let parts: Vec<&str> = line.split('|').collect();
            if parts.len() < 6 {
                continue;
            }
            
            let id = parts[0].to_string();
            let name = parts[1].to_string();
            let image = parts[2].to_string();
            let status = parts[3].to_string();
            let ports_str = parts[4];
            let created = parts[5].to_string();
            
            // 解析端口映射
            let ports = self.parse_docker_ports(ports_str);
            
            containers.push(DockerContainer {
                id,
                name,
                image,
                status,
                ports,
                created,
            });
        }
        
        Ok(containers)
    }
    
    fn parse_docker_ports(&self, ports_str: &str) -> Vec<DockerPort> {
        let mut ports = Vec::new();
        
        // Docker端口格式: 0.0.0.0:8080->80/tcp, :::8080->80/tcp
        for port_mapping in ports_str.split(',') {
            let port_mapping = port_mapping.trim();
            if port_mapping.is_empty() {
                continue;
            }
            
            // 尝试解析端口映射
            if let Some(arrow_pos) = port_mapping.find("->") {
                let host_part = &port_mapping[..arrow_pos];
                let container_part = &port_mapping[arrow_pos + 2..];
                
                // 提取主机端口
                let host_port = if let Some(colon_pos) = host_part.rfind(':') {
                    host_part[colon_pos + 1..].parse::<u16>().ok()
                } else {
                    None
                };
                
                // 提取容器端口和协议
                let mut _container_port = 0;
                let mut protocol = "tcp".to_string();
                
                if let Some(slash_pos) = container_part.find('/') {
                    _container_port = container_part[..slash_pos].parse::<u16>().unwrap_or(0);
                    protocol = container_part[slash_pos + 1..].to_string();
                } else {
                    _container_port = container_part.parse::<u16>().unwrap_or(0);
                }
                
                if let Some(host_port) = host_port {
                    ports.push(DockerPort {
                        container_port: _container_port,
                        host_port,
                        protocol,
                    });
                }
            }
        }
        
        ports
    }
    
    pub fn get_container_by_port(&self, port: u16) -> Result<Option<DockerContainer>, String> {
        let containers = self.get_containers()?;
        
        for container in containers {
            if container.ports.iter().any(|p| p.host_port == port) {
                return Ok(Some(container));
            }
        }
        
        Ok(None)
    }
    
    pub fn stop_container(&self, container_id: &str) -> Result<(), String> {
        if !self.is_docker_available() {
            return Err("Docker未安装或无法访问".to_string());
        }
        
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        let output = Command::new("docker")
            .args(["stop", container_id])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .map_err(|e| format!("停止容器失败: {}", e))?;
            
        if !output.status.success() {
            return Err(format!("停止容器失败: {}", String::from_utf8_lossy(&output.stderr)));
        }
        
        Ok(())
    }
    
    pub fn restart_container(&self, container_id: &str) -> Result<(), String> {
        if !self.is_docker_available() {
            return Err("Docker未安装或无法访问".to_string());
        }
        
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        let output = Command::new("docker")
            .args(["restart", container_id])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .map_err(|e| format!("重启容器失败: {}", e))?;
            
        if !output.status.success() {
            return Err(format!("重启容器失败: {}", String::from_utf8_lossy(&output.stderr)));
        }
        
        Ok(())
    }
    
    pub fn get_container_logs(&self, container_id: &str, lines: usize) -> Result<String, String> {
        if !self.is_docker_available() {
            return Err("Docker未安装或无法访问".to_string());
        }
        
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        
        let output = Command::new("docker")
            .args(["logs", "--tail", &lines.to_string(), container_id])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .map_err(|e| format!("获取容器日志失败: {}", e))?;
            
        if !output.status.success() {
            return Err(format!("获取容器日志失败: {}", String::from_utf8_lossy(&output.stderr)));
        }
        
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
}