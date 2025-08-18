use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

// Example struct (you can adjust it to your needs)
#[derive(Debug, Serialize, Deserialize)]
struct MyData {
    name: String,
    value: i32,
}

// A command to save JSON to a file
#[tauri::command]
fn save_json_file(path: String, data: MyData) -> Result<(), String> {
    let path = PathBuf::from(path);
    serde_json::to_string_pretty(&data)
        .map_err(|e| e.to_string())
        .and_then(|json| {
            fs::write(&path, json).map_err(|e| e.to_string())
        })
}

// A command to load JSON from a file
#[tauri::command]
fn load_json_file(path: String) -> Result<MyData, String> {
    let path = PathBuf::from(path);
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

// Existing greet command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            save_json_file,
            load_json_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
