export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: DockerPort[];
  created: string;
  started_at?: string;
  finished_at?: string;
  project?: string;
  labels?: { [key: string]: string };
  networks?: string[];
  mounts?: DockerMount[];
}

export interface DockerPort {
  container_port: number;
  host_port: number;
  protocol: string;
}

export interface DockerMount {
  source: string;
  destination: string;
  mode: string;
  type: string;
}

export interface DockerContainerDetails {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: string;
  started_at?: string;
  finished_at?: string;
  ports: DockerPort[];
  environment: { [key: string]: string };
  labels: { [key: string]: string };
  networks: string[];
  mounts: DockerMount[];
  resource_usage?: {
    cpu_percent: number;
    memory_usage: number;
    memory_limit: number;
    network_rx: number;
    network_tx: number;
  };
}