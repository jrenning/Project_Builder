#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[allow(non_snake_case)]

use std::fs::File;
use std::fs::create_dir;
use std::path::Path;
use std::fs;
use serde_derive::{Deserialize, Serialize};

// tauri and rust seem to have an error that doesn't allow underscore names to be passed
// to the frontend so camelcase is used 
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

#[derive(Deserialize, Serialize, Debug)]
struct PathSettings {
  path_type: String,
  path: String,
}

#[derive(Deserialize, Serialize, Debug)]
struct PathSetters {
  python: Vec<PathSettings>,
  javascript: Vec<PathSettings>,
}

#[derive(Deserialize, Serialize, Debug)]
struct Settings {
  pathsettings: Vec<PathSetters>
}






// tauri and rust seem to have an error that doesn't allow underscore names to be passed
// to the frontend so camelcase is used 
#[allow(non_snake_case)]
#[tauri::command]
fn write_to_path_settings(key: String, contents: String, settingType: String) {

  // remember to change to right path 
  let input_path = "C:\\Projects\\Tauri\\test\\settings.json";

  let mut settings = {
    // read from settings file in correct format specified by the structs
    let settings = std::fs::read_to_string(&input_path).unwrap();
    serde_json::from_str::<Settings>(&settings).unwrap()
  };

  if settingType == "path" {

    if key == "python" {

      for index in 0..settings.pathsettings.len() {
        settings.pathsettings[index].python[index].path = contents.to_string();
      };
    };

    std::fs::write(
      input_path,
      serde_json::to_string_pretty(&settings).unwrap()
    );

  }

}

#[tauri::command]
fn read_settings(key: String, settingType: String, language: String) -> String {
  // remember to change to right path 
  let input_path = "C:\\Projects\\Tauri\\test\\settings.json";

  let mut settings = std::fs::read_to_string(&input_path).unwrap();

  let settings: Settings = serde_json::from_str(&settings).unwrap();

  if settingType == "path" {

    if language == "python" {
      if key == "path" {
        println!("{:?}",settings.pathsettings[0].python[0].path.to_string());
        return settings.pathsettings[0].python[0].path.to_string();
      };
    };
    if language == "javascript" {
      if key == "path" {
        return settings.pathsettings[0].javascript[0].path.to_string();
      };
    };
  };
  
  return "null".to_string();

}





fn main() {
  tauri::Builder::default()
    // This is where you pass in your commands
    .invoke_handler(tauri::generate_handler![write_file, make_dir, write_to_path_settings, read_settings])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}