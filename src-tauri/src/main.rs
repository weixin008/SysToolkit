/*
 * 系统监控助手 - 一个现代化的Windows系统监控和管理工具
 * Copyright (C) 2025 系统监控助手团队
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod monitor;
mod rules;
mod utils;

// No need to import modules that are only used in the invoke_handler

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
        commands::system_info::get_all_system_info,
        commands::system_info::open_in_explorer,
        commands::system_info::get_computer_name,
        commands::docker_commands::get_docker_containers,
        commands::docker_commands::get_container_by_port,
        commands::docker_commands::stop_container,
        commands::docker_commands::restart_container,
        commands::docker_commands::get_container_logs,
        commands::docker_commands::is_docker_available,
        commands::port_monitor::get_all_ports,
        commands::port_monitor::get_port_info,
        commands::process_analyzer::get_all_processes,
        commands::process_analyzer::get_process_info,
        commands::process_analyzer::kill_process,
        commands::process_analyzer::get_process_by_port,
        commands::shell_commands::run_command,
        commands::shell_commands::open_network_settings,
        commands::shell_commands::open_system_settings,
        commands::shell_commands::open_task_manager,
        commands::shell_commands::open_device_manager,
        commands::shell_commands::open_system_info,
        commands::shell_commands::restart_explorer,
        commands::shell_commands::clean_temp_files,
        commands::shell_commands::run_command_in_new_window,
        commands::shell_commands::open_gui_app,
        commands::shell_commands::open_windows_security,
        commands::shell_commands::get_system_dashboard_info,
        commands::shell_commands::get_system_info_detailed
    ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}