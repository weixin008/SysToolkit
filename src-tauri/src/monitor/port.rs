use std::process::Command;
use serde::{Deserialize, Serialize};
use sysinfo::{System, Pid, RefreshKind};
use crate::commands::port_monitor::{ProcessInfo, ProjectInfo, ActionSuggestion};
use crate::rules::project_detector;
use crate::rules::process_rules::ProcessRules;
use crate::utils::process_utils;

pub struct PortMonitor {
    system: System,
    process_rules: ProcessRules,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PortInfo {
    pub port: u16,
    pub protocol: String,
    pub status: String,
    pub process: ProcessInfo,
    pub project: Option<ProjectInfo>,
    pub suggestions: Vec<ActionSuggestion>,
}

impl PortMonitor {
    pub fn new() -> Self {
        let system = System::new_with_specifics(
            RefreshKind::everything()
        );
        
        PortMonitor {
            system,
            process_rules: ProcessRules::new(),
        }
    }
    
    pub fn refresh(&mut self) {
        self.system.refresh_all();
    }
    
    pub fn get_listening_ports(&mut self) -> Result<Vec<PortInfo>, Box<dyn std::error::Error>> {
        self.refresh();
        
        let mut ports = Vec::new();
        
        // 使用netstat获取端口信息
        let output = if cfg!(target_os = "windows") {
            Command::new("netstat")
                .args(["-ano", "-p", "TCP"])
                .output()?
        } else {
            Command::new("netstat")
                .args(["-tlnp"])
                .output()?
        };

        let output_str = String::from_utf8_lossy(&output.stdout);
        
        for line in output_str.lines() {
            if let Some(port_info) = self.parse_netstat_line(line) {
                ports.push(port_info);
            }
        }

        Ok(ports)
    }
    
    fn parse_netstat_line(&self, line: &str) -> Option<PortInfo> {
        let parts: Vec<&str> = line.split_whitespace().collect();
        
        if parts.len() < 4 {
            return None;
        }

        // Windows netstat格式: TCP 0.0.0.0:3000 0.0.0.0:0 LISTENING 1234
        if cfg!(target_os = "windows") && parts.len() >= 5 {
            if parts[0] != "TCP" || parts[3] != "LISTENING" {
                return None;
            }

            let local_addr = parts[1];
            let port = self.extract_port_from_addr(local_addr)?;
            let pid: u32 = parts[4].parse().ok()?;

            let process_info = self.get_process_info_by_pid(pid)?;
            
            // 使用智能识别引擎检测项目信息
            let project_info = project_detector::detect_project(&process_info, port);
            
            // 生成操作建议
            let suggestions = self.generate_suggestions(&process_info, &project_info);

            return Some(PortInfo {
                port,
                protocol: "TCP".to_string(),
                status: "LISTENING".to_string(),
                process: process_info,
                project: project_info,
                suggestions,
            });
        }

        None
    }
    
    fn extract_port_from_addr(&self, addr: &str) -> Option<u16> {
        addr.split(':').last()?.parse().ok()
    }
    
    fn get_process_info_by_pid(&self, pid: u32) -> Option<ProcessInfo> {
        let process = self.system.process(Pid::from(pid as usize))?;
        
        Some(ProcessInfo {
            pid,
            name: process.name().to_string(),
            exe_path: process.exe().map(|path| path.to_string_lossy().to_string()),
            cmd: process.cmd().to_vec(),
        })
    }
    
    fn generate_suggestions(
        &self,
        process: &ProcessInfo, 
        project: &Option<ProjectInfo>
    ) -> Vec<ActionSuggestion> {
        let mut suggestions = Vec::new();

        // 首先检查是否有预定义的规则
        if let Some(rule) = self.process_rules.get_rule_by_name(&process.name) {
            for action in &rule.actions {
                let (description, risk_level) = match action.as_str() {
                    "停止服务" => ("终止进程释放端口", "低"),
                    "重启" => ("重启服务", "低"),
                    "查看日志" => ("查看应用日志", "无"),
                    "关闭" => ("关闭应用", "低"),
                    "查看容器" => ("显示相关Docker容器信息", "无"),
                    "停止容器" => ("停止Docker容器释放端口", "中"),
                    "查看任务管理器" => ("查看浏览器任务管理器", "无"),
                    "保存文档" => ("保存当前文档后关闭", "低"),
                    "查看服务详情" => ("查看Windows服务详情", "无"),
                    _ => ("执行操作", "中"),
                };
                
                suggestions.push(ActionSuggestion {
                    action: action.clone(),
                    description: description.to_string(),
                    risk_level: risk_level.to_string(),
                });
            }
            
            return suggestions;
        }

        // 如果没有预定义规则，使用通用逻辑
        match process.name.as_str() {
            "node.exe" | "node" => {
                suggestions.push(ActionSuggestion {
                    action: "停止服务".to_string(),
                    description: "终止Node.js进程释放端口".to_string(),
                    risk_level: "低".to_string(),
                });
                
                if project.is_some() {
                    suggestions.push(ActionSuggestion {
                        action: "重启服务".to_string(),
                        description: "重启开发服务器".to_string(),
                        risk_level: "低".to_string(),
                    });
                    
                    suggestions.push(ActionSuggestion {
                        action: "打开浏览器".to_string(),
                        description: "在浏览器中查看应用".to_string(),
                        risk_level: "无".to_string(),
                    });
                }
            }
            "docker-proxy.exe" | "docker-proxy" => {
                suggestions.push(ActionSuggestion {
                    action: "查看容器".to_string(),
                    description: "显示相关Docker容器信息".to_string(),
                    risk_level: "无".to_string(),
                });
                
                suggestions.push(ActionSuggestion {
                    action: "停止容器".to_string(),
                    description: "停止Docker容器释放端口".to_string(),
                    risk_level: "中".to_string(),
                });
            }
            _ => {
                // 检查是否是系统进程
                if process_utils::is_system_process(&process.name) {
                    suggestions.push(ActionSuggestion {
                        action: "查看详情".to_string(),
                        description: "查看系统进程详细信息".to_string(),
                        risk_level: "无".to_string(),
                    });
                } else {
                    suggestions.push(ActionSuggestion {
                        action: "终止进程".to_string(),
                        description: "强制终止进程释放端口".to_string(),
                        risk_level: "高".to_string(),
                    });
                }
            }
        }

        suggestions
    }
}
