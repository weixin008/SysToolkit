export interface PortInfo {
  port: number;
  protocol: 'TCP' | 'UDP';
  status: 'LISTENING' | 'ESTABLISHED';
  process: ProcessInfo;
  project?: ProjectInfo;
  suggestions: ActionSuggestion[];
}

export interface ProcessInfo {
  pid: number;
  name: string;
  exe_path?: string;
  cmd: string[];
}

export interface ProjectInfo {
  name: string;
  project_type: string;
  path?: string;
  description: string;
}

export interface ActionSuggestion {
  action: string;
  description: string;
  risk_level: string;
}

export interface PortFilterOptions {
  search: string;
  type?: 'all' | 'development' | 'system' | 'docker';
  status?: 'all' | 'listening' | 'established';
}