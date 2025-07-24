export interface FileOccupancy {
  filePath: string;
  fileName: string;
  occupiedBy: ProcessInfo[];
  reason: string;
  impact: 'Low' | 'Medium' | 'High';
  solutions: Solution[];
}

export interface ProcessInfo {
  pid: number;
  name: string;
  friendlyName: string;
  exe_path?: string;
}

export interface Solution {
  action: string;
  description: string;
  risk_level: string;
  command?: string;
}