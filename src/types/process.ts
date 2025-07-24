export interface DetailedProcessInfo {
  pid: number;
  name: string;
  exe_path?: string;
  cmd: string[];
  cpu_usage: number;
  memory_usage: number;
  status: string;
  start_time: number;
}

export interface ProcessCategory {
  name: string;
  description: string;
  icon: string;
  color: string;
}