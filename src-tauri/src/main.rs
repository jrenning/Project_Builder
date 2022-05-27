#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[allow(non_snake_case)]

use std::fs::File;
use std::fs::create_dir;
use std::path::Path;
use std::fs;


#[allow(non_snake_case)]
#[tauri::command]
fn write_file(fileName: String, dir: String) -> bool {
  let file_path = format!("{}{}", dir, fileName);
  // if file already exists do nothing 
  if Path::new(&file_path).exists() {
    return false;
  }
  let _file = File::create(file_path).expect("File could not be created");
  return true;
}


#[tauri::command]
fn make_dir(dir: String, path: String) -> bool{
  let file_path = format!("{}{}", path, dir);
  // if file already exists do nothing 
  if Path::new(&file_path).exists() {
    return false;
  }
  create_dir(file_path).expect("Directory could not be created");
  return true;
}


#[tauri::command]
fn write_to_file(path: String, contents: String) {
  fs::write(path, contents).expect("Unable to write to file")
}


fn main() {
  tauri::Builder::default()
    // This is where you pass in your commands
    .invoke_handler(tauri::generate_handler![write_file, make_dir, write_to_file])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}