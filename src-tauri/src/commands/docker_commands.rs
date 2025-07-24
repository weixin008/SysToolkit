use crate::monitor::docker::{DockerMonitor, DockerContainer};

#[tauri::command]
pub async fn get_docker_containers() -> Result<Vec<DockerContainer>, String> {
    let docker_monitor = DockerMonitor::new();
    docker_monitor.get_containers()
}

#[tauri::command]
pub async fn get_container_by_port(port: u16) -> Result<Option<DockerContainer>, String> {
    let docker_monitor = DockerMonitor::new();
    docker_monitor.get_container_by_port(port)
}

#[tauri::command]
pub async fn stop_container(container_id: &str) -> Result<(), String> {
    let docker_monitor = DockerMonitor::new();
    docker_monitor.stop_container(container_id)
}

#[tauri::command]
pub async fn restart_container(container_id: &str) -> Result<(), String> {
    let docker_monitor = DockerMonitor::new();
    docker_monitor.restart_container(container_id)
}

#[tauri::command]
pub async fn get_container_logs(container_id: &str, lines: usize) -> Result<String, String> {
    let docker_monitor = DockerMonitor::new();
    docker_monitor.get_container_logs(container_id, lines)
}

#[tauri::command]
pub async fn is_docker_available() -> bool {
    let docker_monitor = DockerMonitor::new();
    docker_monitor.is_docker_available()
}