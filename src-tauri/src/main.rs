#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[allow(non_snake_case)]

use std::fs::File;
use std::fs::create_dir;
use std::path::Path;
use serde_derive::{Deserialize, Serialize};
use std::ops::{Index, IndexMut};

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

#[derive(Deserialize, Serialize, Debug, Clone)]
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

// allows for indexing of Settings
impl Index<&'_ str> for Settings {
  type Output = Vec<PathSetters>;
  fn index(&self, s: &str) -> &Vec<PathSetters> {
    match s {
      "pathsettings" => &self.pathsettings,
      _ => panic!("unknown field: {}", s),
    }
  }
}

// allows for mutations using indexes of settings 
impl IndexMut<&'_ str> for Settings {
  fn index_mut(&mut self, s: &str) -> &mut Vec<PathSetters> {
    match s {
      "pathsettings" => &mut self.pathsettings,
      _ => panic!("unknown field: {}", s)
    }
  }
}

// allows for indexing of path settings
impl Index<&'_ str> for PathSetters {
  type Output = Vec<PathSettings>;
  fn index(&self, s: &str) -> &Vec<PathSettings> {
    match s {
      "python" => &self.python,
      "javascript" => &self.javascript,
      _ => panic!("unknown field: {}", s),
    }
  }
}

// allows for mutations using indexes of settings 
impl IndexMut<&'_ str> for PathSetters {
  fn index_mut(&mut self, s: &str) -> &mut Vec<PathSettings> {
    match s {
      "python" => &mut self.python,
      "javascript" => &mut self.javascript,
      _ => panic!("unknown field: {}", s),
    }
  }
}

// allows for indexing of path settings components 
impl Index<&'_ str> for PathSettings {
  type Output = String;
  fn index(&self, s: &str) -> &String {
    match s {
      "path_type" => &self.path_type,
      "path" => &self.path,
      _ => panic!("unknown field: {}", s),
    }
  }
}

// allows for mutations using indexes of settings 
impl IndexMut<&'_ str> for PathSettings {
  fn index_mut(&mut self, s: &str) -> &mut String {
    match s {
      "path_type" => &mut self.path_type,
      "path" => &mut self.path,
      _ => panic!("unknown field: {}", s),
    }
  }
}




// tauri and rust seem to have an error that doesn't allow underscore names to be passed
// to the frontend so camelcase is used 
#[allow(non_snake_case)]
#[tauri::command]
fn write_to_path_settings(key: String, contents: String, settingType: String, language: String) {

  // remember to change to right path 
  let input_path = "C:\\Projects\\Tauri\\test\\settings.json";

  let mut settings = {
    // read from settings file in correct format specified by the structs
    let settings = std::fs::read_to_string(&input_path).unwrap();
    serde_json::from_str::<Settings>(&settings).unwrap()
  };

  if settingType == "path" {
    settings["pathsettings"][0][&language][0][&key] = contents.to_string();
  }

  std::fs::write(
  input_path,
  serde_json::to_string_pretty(&settings).unwrap()
  ).expect("Bad write to file");  

}

#[allow(non_snake_case)]
#[tauri::command]
fn read_settings(key: String, settingType: String, language: String) -> String{
  // remember to change to right path 
  let input_path = "C:\\Projects\\Tauri\\test\\settings.json";

  let settings = std::fs::read_to_string(&input_path).unwrap();

  let settings: Settings = serde_json::from_str(&settings).unwrap();

  if settingType == "path" {
    return settings["pathsettings"][0][&language][0][&key].clone();
  }
  else {
    return "null".to_string();
  }

}





fn main() {
  tauri::Builder::default()
    // This is where you pass in your commands
    .invoke_handler(tauri::generate_handler![write_file, make_dir, write_to_path_settings, read_settings])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}