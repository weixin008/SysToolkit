use std::path::Path;
use sysinfo::{System, RefreshKind};
use crate::commands::file_monitor::{FileOccupancy, ProcessInfo, Solution};

pub struct FileMonitor {
    system: System,
}

impl FileMonitor {
    pub fn new() -> Self {
        let system = System::new_with_specifics(
            RefreshKind::everything()
        );
        
        FileMonitor {
            system,
        }
    }
    
    pub fn refresh(&mut self) {
        self.system.refresh_all();
    }
    
    pub fn check_file_occupancy(&mut self, file_path: &str) -> Option<FileOccupancy> {
        self.refresh();
        
        // 检查文件是否存在
        if !Path::new(file_path).exists() {
            return None;
        }
        
        // 在Windows上，我们需要使用特殊的API来检查文件占用
        // 这里是一个简单的模拟实现，实际项目中需要使用Windows API
        
        // 模拟检测文件占用
        self.detect_file_occupancy(file_path)
    }
    
    // 这个函数在实际项目中需要使用Windows API实现
    fn detect_file_occupancy(&self, file_path: &str) -> Option<FileOccupancy> {
        // 这里只是一个模拟实现，实际项目中需要使用Windows API
        // 例如，可以使用RestartManager API或其他方法
        
        // 模拟一些常见的文件占用情况
        let file_name = Path::new(file_path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown");
            
        let extension = Path::new(file_path)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("");
            
        // 根据文件扩展名模拟不同的占用情况
        match extension {
            "pdf" => {
                // 模拟PDF文件被Adobe Reader占用
                let process = ProcessInfo {
                    pid: 9999, // 模拟PID
                    name: "AcroRd32.exe".to_string(),
                    friendly_name: "Adobe Acrobat Reader".to_string(),
                    exe_path: Some("C:\\Program Files (x86)\\Adobe\\Acrobat Reader DC\\Reader\\AcroRd32.exe".to_string()),
                };
                
                let processes = vec![process.clone()];
                let (reason, impact, solutions) = self.generate_reason_and_solutions(file_path, &processes);
                
                Some(FileOccupancy {
                    file_path: file_path.to_string(),
                    file_name: file_name.to_string(),
                    occupied_by: processes,
                    reason,
                    impact,
                    solutions,
                })
            },
            "docx" | "doc" => {
                // 模拟Word文档被Office占用
                let process = ProcessInfo {
                    pid: 9998, // 模拟PID
                    name: "WINWORD.EXE".to_string(),
                    friendly_name: "Microsoft Word".to_string(),
                    exe_path: Some("C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE".to_string()),
                };
                
                let processes = vec![process.clone()];
                let (reason, impact, solutions) = self.generate_reason_and_solutions(file_path, &processes);
                
                Some(FileOccupancy {
                    file_path: file_path.to_string(),
                    file_name: file_name.to_string(),
                    occupied_by: processes,
                    reason,
                    impact,
                    solutions,
                })
            },
            "xlsx" | "xls" => {
                // 模拟Excel文件被Office占用
                let process = ProcessInfo {
                    pid: 9997, // 模拟PID
                    name: "EXCEL.EXE".to_string(),
                    friendly_name: "Microsoft Excel".to_string(),
                    exe_path: Some("C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE".to_string()),
                };
                
                let processes = vec![process.clone()];
                let (reason, impact, solutions) = self.generate_reason_and_solutions(file_path, &processes);
                
                Some(FileOccupancy {
                    file_path: file_path.to_string(),
                    file_name: file_name.to_string(),
                    occupied_by: processes,
                    reason,
                    impact,
                    solutions,
                })
            },
            _ => None, // 其他类型文件暂不模拟占用
        }
    }
    
    fn generate_reason_and_solutions(&self, _file_path: &str, processes: &[ProcessInfo]) -> (String, String, Vec<Solution>) {
        if processes.is_empty() {
            return (
                "未知原因".to_string(),
                "Low".to_string(),
                vec![],
            );
        }
        
        let process = &processes[0];
        
        // 根据进程类型生成不同的原因和解决方案
        match process.name.as_str() {
            "AcroRd32.exe" => {
                (
                    "文件正在被PDF阅读器查看，无法删除或移动".to_string(),
                    "Medium".to_string(),
                    vec![
                        Solution {
                            action: "关闭PDF阅读器".to_string(),
                            description: "关闭Adobe Acrobat Reader后再进行文件操作".to_string(),
                            risk_level: "低".to_string(),
                            command: None,
                        },
                        Solution {
                            action: "强制关闭".to_string(),
                            description: "强制终止Adobe Reader进程，可能导致未保存的更改丢失".to_string(),
                            risk_level: "中".to_string(),
                            command: Some(format!("taskkill /F /PID {}", process.pid)),
                        },
                    ],
                )
            },
            "WINWORD.EXE" => {
                (
                    "文件正在被Microsoft Word编辑，无法删除或移动".to_string(),
                    "High".to_string(),
                    vec![
                        Solution {
                            action: "保存并关闭Word".to_string(),
                            description: "在Word中保存文档并关闭后再进行文件操作".to_string(),
                            risk_level: "低".to_string(),
                            command: None,
                        },
                        Solution {
                            action: "强制关闭".to_string(),
                            description: "强制终止Word进程，可能导致未保存的更改丢失".to_string(),
                            risk_level: "高".to_string(),
                            command: Some(format!("taskkill /F /PID {}", process.pid)),
                        },
                    ],
                )
            },
            "EXCEL.EXE" => {
                (
                    "文件正在被Microsoft Excel编辑，无法删除或移动".to_string(),
                    "High".to_string(),
                    vec![
                        Solution {
                            action: "保存并关闭Excel".to_string(),
                            description: "在Excel中保存文档并关闭后再进行文件操作".to_string(),
                            risk_level: "低".to_string(),
                            command: None,
                        },
                        Solution {
                            action: "强制关闭".to_string(),
                            description: "强制终止Excel进程，可能导致未保存的更改丢失".to_string(),
                            risk_level: "高".to_string(),
                            command: Some(format!("taskkill /F /PID {}", process.pid)),
                        },
                    ],
                )
            },
            _ => {
                (
                    format!("文件正在被{}使用，无法删除或移动", process.friendly_name),
                    "Medium".to_string(),
                    vec![
                        Solution {
                            action: "关闭应用".to_string(),
                            description: format!("关闭{}后再进行文件操作", process.friendly_name),
                            risk_level: "低".to_string(),
                            command: None,
                        },
                        Solution {
                            action: "强制关闭".to_string(),
                            description: format!("强制终止{}进程，可能导致未保存的更改丢失", process.friendly_name),
                            risk_level: "中".to_string(),
                            command: Some(format!("taskkill /F /PID {}", process.pid)),
                        },
                    ],
                )
            },
        }
    }
}