// Prevents an additional console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// The pattern for app commands: take typed args, return a typed value.
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! You have been greeted from Rust.")
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running the tauri application");
}
