use serde::{Deserialize, Serialize};
use std::path::Path;
use crate::commands::port_monitor::{ProcessInfo, ProjectInfo};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSignature {
    pub name: String,
    pub project_type: String,
    pub description: String,
    pub process_names: Vec<String>,
    pub command_patterns: Vec<String>,
    pub port_ranges: Option<Vec<(u16, u16)>>,
}

pub fn detect_project(process: &ProcessInfo, port: u16) -> Option<ProjectInfo> {
    let signatures = get_project_signatures();
    
    for signature in signatures {
        // 检查进程名是否匹配
        if signature.process_names.iter().any(|name| process.name.contains(name)) {
            // 检查命令行参数是否匹配
            if signature.command_patterns.iter().any(|pattern| 
                process.cmd.iter().any(|cmd| cmd.contains(pattern))
            ) {
                // 检查端口范围是否匹配
                if let Some(ranges) = &signature.port_ranges {
                    if !ranges.iter().any(|(start, end)| port >= *start && port <= *end) {
                        continue;
                    }
                }
                
                // 提取项目路径
                let path = extract_project_path(&process.cmd);
                
                return Some(ProjectInfo {
                    name: signature.name,
                    project_type: signature.project_type,
                    path,
                    description: signature.description,
                });
            }
        }
    }
    
    // 如果没有匹配到预定义的项目，尝试通用检测
    detect_generic_project(process, port)
}

fn extract_project_path(cmd: &[String]) -> Option<String> {
    // 尝试从命令行参数中提取项目路径
    for arg in cmd {
        if arg.contains("\\") || arg.contains("/") {
            if let Some(parent) = Path::new(arg).parent() {
                return Some(parent.to_string_lossy().to_string());
            }
        }
    }
    None
}

fn detect_generic_project(process: &ProcessInfo, _port: u16) -> Option<ProjectInfo> {
    match process.name.as_str() {
        "node.exe" | "node" => {
            // 检测Node.js项目类型
            if process.cmd.iter().any(|arg| arg.contains("react-scripts")) {
                Some(ProjectInfo {
                    name: "React开发服务器".to_string(),
                    project_type: "React".to_string(),
                    path: extract_project_path(&process.cmd),
                    description: "前端React开发项目，提供热重载和开发服务".to_string(),
                })
            } else if process.cmd.iter().any(|arg| arg.contains("vue-cli")) {
                Some(ProjectInfo {
                    name: "Vue开发服务器".to_string(),
                    project_type: "Vue".to_string(),
                    path: extract_project_path(&process.cmd),
                    description: "前端Vue开发项目".to_string(),
                })
            } else if process.cmd.iter().any(|arg| arg.contains("next")) {
                Some(ProjectInfo {
                    name: "Next.js开发服务器".to_string(),
                    project_type: "Next.js".to_string(),
                    path: extract_project_path(&process.cmd),
                    description: "React框架Next.js开发项目".to_string(),
                })
            } else {
                Some(ProjectInfo {
                    name: "Node.js应用".to_string(),
                    project_type: "Node.js".to_string(),
                    path: extract_project_path(&process.cmd),
                    description: "Node.js后端服务或工具".to_string(),
                })
            }
        }
        "java.exe" | "java" => {
            // 检测Java项目类型
            if process.cmd.iter().any(|arg| arg.contains("spring")) {
                Some(ProjectInfo {
                    name: "Spring Boot应用".to_string(),
                    project_type: "Spring".to_string(),
                    path: extract_project_path(&process.cmd),
                    description: "Java Spring Boot后端服务".to_string(),
                })
            } else {
                Some(ProjectInfo {
                    name: "Java应用".to_string(),
                    project_type: "Java".to_string(),
                    path: extract_project_path(&process.cmd),
                    description: "Java应用程序".to_string(),
                })
            }
        }
        "python.exe" | "python" | "python3" => {
            // 检测Python项目类型
            if process.cmd.iter().any(|arg| arg.contains("flask")) {
                Some(ProjectInfo {
                    name: "Flask应用".to_string(),
                    project_type: "Flask".to_string(),
                    path: extract_project_path(&process.cmd),
                    description: "Python Flask Web应用".to_string(),
                })
            } else if process.cmd.iter().any(|arg| arg.contains("django")) {
                Some(ProjectInfo {
                    name: "Django应用".to_string(),
                    project_type: "Django".to_string(),
                    path: extract_project_path(&process.cmd),
                    description: "Python Django Web应用".to_string(),
                })
            } else {
                Some(ProjectInfo {
                    name: "Python应用".to_string(),
                    project_type: "Python".to_string(),
                    path: extract_project_path(&process.cmd),
                    description: "Python应用程序".to_string(),
                })
            }
        }
        "docker-proxy.exe" | "docker-proxy" => {
            Some(ProjectInfo {
                name: "Docker容器".to_string(),
                project_type: "Docker".to_string(),
                path: None,
                description: "Docker容器端口映射".to_string(),
            })
        }
        _ => None,
    }
}

fn get_project_signatures() -> Vec<ProjectSignature> {
    vec![
        // React项目
        ProjectSignature {
            name: "React开发服务器".to_string(),
            project_type: "React".to_string(),
            description: "前端React开发项目，提供热重载和开发服务".to_string(),
            process_names: vec!["node".to_string()],
            command_patterns: vec!["react-scripts".to_string(), "webpack".to_string()],
            port_ranges: Some(vec![(3000, 3999)]),
        },
        
        // Vue项目
        ProjectSignature {
            name: "Vue开发服务器".to_string(),
            project_type: "Vue".to_string(),
            description: "前端Vue开发项目".to_string(),
            process_names: vec!["node".to_string()],
            command_patterns: vec!["vue-cli".to_string(), "vite".to_string()],
            port_ranges: Some(vec![(5173, 5173), (8080, 8080)]),
        },
        
        // Next.js项目
        ProjectSignature {
            name: "Next.js开发服务器".to_string(),
            project_type: "Next.js".to_string(),
            description: "React框架Next.js开发项目".to_string(),
            process_names: vec!["node".to_string()],
            command_patterns: vec!["next".to_string()],
            port_ranges: Some(vec![(3000, 3000)]),
        },
        
        // Spring Boot项目
        ProjectSignature {
            name: "Spring Boot应用".to_string(),
            project_type: "Spring".to_string(),
            description: "Java Spring Boot后端服务".to_string(),
            process_names: vec!["java".to_string()],
            command_patterns: vec!["spring-boot".to_string()],
            port_ranges: Some(vec![(8080, 8080)]),
        },
        
        // Flask项目
        ProjectSignature {
            name: "Flask应用".to_string(),
            project_type: "Flask".to_string(),
            description: "Python Flask Web应用".to_string(),
            process_names: vec!["python".to_string()],
            command_patterns: vec!["flask".to_string()],
            port_ranges: Some(vec![(5000, 5000)]),
        },
        
        // Django项目
        ProjectSignature {
            name: "Django应用".to_string(),
            project_type: "Django".to_string(),
            description: "Python Django Web应用".to_string(),
            process_names: vec!["python".to_string()],
            command_patterns: vec!["django".to_string(), "runserver".to_string()],
            port_ranges: Some(vec![(8000, 8000)]),
        },
    ]
}