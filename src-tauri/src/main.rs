#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[allow(non_snake_case)]

use std::fs::File;
use std::fs::create_dir;

/*fn main() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}*/

#[allow(non_snake_case)]
#[tauri::command]
fn write_file(fileName: String, dir: String) {
  let file_path = format!("{}{}", dir, fileName);
  let _file = File::create(file_path).expect("File could not be created");
}

#[tauri::command]
fn make_dir(dir: String, path: String){
  let file_path = format!("{}{}", path, dir);
  create_dir(file_path).expect("Directory could not be created");
}


fn main() {
  tauri::Builder::default()
    // This is where you pass in your commands
    .invoke_handler(tauri::generate_handler![write_file, make_dir])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}