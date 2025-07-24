import React from 'react';

interface PortOverviewProps {
  stats: {
    development: number;
    system: number;
    docker: number;
    conflicts: number;
  };
}

const PortOverview: React.FC<PortOverviewProps> = ({ stats }) => {
  return (
    <div className="overview-stats mb-6">
      <div className="stat-card">
        <div className="flex items-center justify-center">
          <span className="status-indicator status-green"></span>
          <span className="stat-label">开发端口</span>
        </div>
        <div className="stat-value">{stats.development}</div>
      </div>
      
      <div className="stat-card">
        <div className="flex items-center justify-center">
          <span className="status-indicator status-yellow"></span>
          <span className="stat-label">系统端口</span>
        </div>
        <div className="stat-value">{stats.system}</div>
      </div>
      
      <div className="stat-card">
        <div className="flex items-center justify-center">
          <span className="status-indicator status-blue"></span>
          <span className="stat-label">Docker端口</span>
        </div>
        <div className="stat-value">{stats.docker}</div>
      </div>
      
      <div className="stat-card">
        <div className="flex items-center justify-center">
          <span className="status-indicator status-red"></span>
          <span className="stat-label">端口冲突</span>
        </div>
        <div className="stat-value">{stats.conflicts}</div>
      </div>
    </div>
  );
};

export default PortOverview;