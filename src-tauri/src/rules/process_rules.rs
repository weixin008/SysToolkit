use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProcessCategory {
    Development,
    Browser,
    Database,
    System,
    Docker,
    Office,
    Media,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessRule {
    pub process_name: String,
    pub app_name: String,
    pub description: String,
    pub category: ProcessCategory,
    pub port_ranges: Option<Vec<(u16, u16)>>,
    pub actions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessRules {
    pub rules: Vec<ProcessRule>,
    pub name_map: HashMap<String, usize>,
}

impl ProcessRules {
    pub fn new() -> Self {
        let rules = create_default_rules();
        let mut name_map = HashMap::new();
        
        for (i, rule) in rules.iter().enumerate() {
            name_map.insert(rule.process_name.clone(), i);
        }
        
        ProcessRules { rules, name_map }
    }
    
    pub fn get_rule_by_name(&self, process_name: &str) -> Option<&ProcessRule> {
        self.name_map.get(process_name).map(|&i| &self.rules[i])
    }
    
    pub fn get_rule_by_port(&self, port: u16) -> Option<&ProcessRule> {
        self.rules.iter().find(|rule| {
            if let Some(ranges) = &rule.port_ranges {
                ranges.iter().any(|(start, end)| port >= *start && port <= *end)
            } else {
                false
            }
        })
    }
}

fn create_default_rules() -> Vec<ProcessRule> {
    vec![
        // 开发工具
        ProcessRule {
            process_name: "node.exe".to_string(),
            app_name: "Node.js".to_string(),
            description: "JavaScript运行时环境，用于开发Web应用".to_string(),
            category: ProcessCategory::Development,
            port_ranges: Some(vec![(3000, 3999), (8000, 8999)]),
            actions: vec![
                "停止服务".to_string(),
                "重启".to_string(),
                "查看日志".to_string(),
            ],
        },
        ProcessRule {
            process_name: "java.exe".to_string(),
            app_name: "Java应用".to_string(),
            description: "Java运行时环境，用于运行Java应用".to_string(),
            category: ProcessCategory::Development,
            port_ranges: Some(vec![(8080, 8099), (9000, 9999)]),
            actions: vec![
                "停止服务".to_string(),
                "重启".to_string(),
                "查看日志".to_string(),
            ],
        },
        ProcessRule {
            process_name: "python.exe".to_string(),
            app_name: "Python应用".to_string(),
            description: "Python解释器，用于运行Python应用".to_string(),
            category: ProcessCategory::Development,
            port_ranges: Some(vec![(5000, 5999), (8000, 8999)]),
            actions: vec![
                "停止服务".to_string(),
                "重启".to_string(),
                "查看日志".to_string(),
            ],
        },
        
        // 浏览器
        ProcessRule {
            process_name: "chrome.exe".to_string(),
            app_name: "Google Chrome".to_string(),
            description: "Google Chrome浏览器".to_string(),
            category: ProcessCategory::Browser,
            port_ranges: None,
            actions: vec![
                "关闭".to_string(),
                "查看任务管理器".to_string(),
            ],
        },
        ProcessRule {
            process_name: "firefox.exe".to_string(),
            app_name: "Mozilla Firefox".to_string(),
            description: "Mozilla Firefox浏览器".to_string(),
            category: ProcessCategory::Browser,
            port_ranges: None,
            actions: vec![
                "关闭".to_string(),
                "查看任务管理器".to_string(),
            ],
        },
        ProcessRule {
            process_name: "msedge.exe".to_string(),
            app_name: "Microsoft Edge".to_string(),
            description: "Microsoft Edge浏览器".to_string(),
            category: ProcessCategory::Browser,
            port_ranges: None,
            actions: vec![
                "关闭".to_string(),
                "查看任务管理器".to_string(),
            ],
        },
        
        // 数据库
        ProcessRule {
            process_name: "mysqld.exe".to_string(),
            app_name: "MySQL数据库".to_string(),
            description: "MySQL数据库服务器".to_string(),
            category: ProcessCategory::Database,
            port_ranges: Some(vec![(3306, 3306)]),
            actions: vec![
                "停止服务".to_string(),
                "重启".to_string(),
                "查看日志".to_string(),
            ],
        },
        ProcessRule {
            process_name: "postgres.exe".to_string(),
            app_name: "PostgreSQL数据库".to_string(),
            description: "PostgreSQL数据库服务器".to_string(),
            category: ProcessCategory::Database,
            port_ranges: Some(vec![(5432, 5432)]),
            actions: vec![
                "停止服务".to_string(),
                "重启".to_string(),
                "查看日志".to_string(),
            ],
        },
        ProcessRule {
            process_name: "mongod.exe".to_string(),
            app_name: "MongoDB数据库".to_string(),
            description: "MongoDB数据库服务器".to_string(),
            category: ProcessCategory::Database,
            port_ranges: Some(vec![(27017, 27017)]),
            actions: vec![
                "停止服务".to_string(),
                "重启".to_string(),
                "查看日志".to_string(),
            ],
        },
        
        // Docker
        ProcessRule {
            process_name: "docker.exe".to_string(),
            app_name: "Docker引擎".to_string(),
            description: "Docker容器化平台".to_string(),
            category: ProcessCategory::Docker,
            port_ranges: None,
            actions: vec![
                "查看容器".to_string(),
                "查看镜像".to_string(),
                "重启Docker".to_string(),
            ],
        },
        ProcessRule {
            process_name: "docker-proxy.exe".to_string(),
            app_name: "Docker容器".to_string(),
            description: "Docker容器端口映射代理".to_string(),
            category: ProcessCategory::Docker,
            port_ranges: None,
            actions: vec![
                "查看容器".to_string(),
                "停止容器".to_string(),
                "查看日志".to_string(),
            ],
        },
        
        // 系统服务
        ProcessRule {
            process_name: "svchost.exe".to_string(),
            app_name: "Windows系统服务".to_string(),
            description: "Windows系统服务宿主进程".to_string(),
            category: ProcessCategory::System,
            port_ranges: None,
            actions: vec![
                "查看服务详情".to_string(),
            ],
        },
        ProcessRule {
            process_name: "System".to_string(),
            app_name: "Windows系统".to_string(),
            description: "Windows操作系统内核".to_string(),
            category: ProcessCategory::System,
            port_ranges: None,
            actions: vec![],
        },
        
        // 办公软件
        ProcessRule {
            process_name: "WINWORD.EXE".to_string(),
            app_name: "Microsoft Word".to_string(),
            description: "Microsoft Office Word文档处理软件".to_string(),
            category: ProcessCategory::Office,
            port_ranges: None,
            actions: vec![
                "关闭".to_string(),
                "保存文档".to_string(),
            ],
        },
        ProcessRule {
            process_name: "EXCEL.EXE".to_string(),
            app_name: "Microsoft Excel".to_string(),
            description: "Microsoft Office Excel电子表格软件".to_string(),
            category: ProcessCategory::Office,
            port_ranges: None,
            actions: vec![
                "关闭".to_string(),
                "保存文档".to_string(),
            ],
        },
        
        // 媒体软件
        ProcessRule {
            process_name: "vlc.exe".to_string(),
            app_name: "VLC媒体播放器".to_string(),
            description: "开源跨平台媒体播放器".to_string(),
            category: ProcessCategory::Media,
            port_ranges: None,
            actions: vec![
                "关闭".to_string(),
            ],
        },
    ]
}