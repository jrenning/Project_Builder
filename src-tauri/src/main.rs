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

// settings structs



#[derive(Deserialize, Serialize, Debug)]
struct OverallSettings {
  path_settings: PathSetters,
  file_structure_settings: FileSetters
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
  rust: Vec<PathSettings>
}

// file settings 
#[derive(Deserialize, Serialize, Debug)]
struct FileSetters {
  python: Vec<String>,
  javascript: Vec<String>,
  rust: Vec<String>
}

#[derive(Deserialize, Serialize, Debug)]
struct FileSettings {
  file_structure_settings: FileSetters
}



// methods for indexing and mutating settings structs 

// allows for indexing of path settings
impl Index<&'_ str> for PathSetters {
  type Output = Vec<PathSettings>;
  fn index(&self, s: &str) -> &Vec<PathSettings> {
    match s {
      "python" => &self.python,
      "javascript" => &self.javascript,
      "rust" => &self.rust,
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
      "rust" => &mut self.rust,
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


impl Index<&'_ str> for FileSetters {
  type Output = Vec<String>;
  fn index(&self, s: &str) -> &Vec<String> {
    match s {
      "python" => &self.python,
      "javascript" => &self.javascript,
      "rust" => &self.rust,
      _ => panic!("unknown field: {}", s),
    }
  }
}

// allows for mutations using indexes of settings 
impl IndexMut<&'_ str> for FileSetters {
  fn index_mut(&mut self, s: &str) -> &mut Vec<String> {
    match s {
      "python" => &mut self.python,
      "javascript" => &mut self.javascript,
      "rust" => &mut self.rust,
      _ => panic!("unknown field: {}", s),
    }
  }
}


// tauri and rust seem to have an error that doesn't allow underscore names to be passed
// to the frontend so camelcase is used 
#[allow(non_snake_case)]
#[tauri::command]
fn write_to_path_settings(key: String, contents: String, language: String, inputPath: String) {

  // remember to change to right path 

  let mut settings = {
    // read from settings file in correct format specified by the structs
    let settings = std::fs::read_to_string(&inputPath).unwrap();
    serde_json::from_str::<OverallSettings>(&settings).unwrap()
  };

  settings.path_settings[&language][0][&key] = contents.to_string();


  std::fs::write(
  inputPath,
  serde_json::to_string_pretty(&settings).unwrap()
  ).expect("Bad write to file");  

}

#[allow(non_snake_case)]
#[tauri::command]
fn read_settings(key: String, inputPath: String, language: String) -> String{
  // remember to change to right path 
  //let settings = std::fs::read_to_string(&input_path).unwrap();
  let settings = {
    // read from settings file in correct format specified by the structs
    let settings = std::fs::read_to_string(&inputPath).unwrap();
    serde_json::from_str::<OverallSettings>(&settings).unwrap()
  };

  return settings.path_settings[&language][0][&key].clone();

}

#[allow(non_snake_case)]
#[tauri::command]
fn read_file_settings(language: String, inputPath: String) -> Vec<String> {

  let file_settings = {
  // read from settings file in correct format specified by the structs
  let file_settings = std::fs::read_to_string(&inputPath).unwrap();
  serde_json::from_str::<FileSettings>(&file_settings).unwrap()
  };
  return file_settings.file_structure_settings[&language].clone();
}

#[allow(non_snake_case)]
#[tauri::command]
fn write_file_settings(language: String, inputPath: String, operation: String, file: &str) -> bool {
  let mut file_settings = {
  // read from settings file in correct format specified by the structs
  let file_settings = std::fs::read_to_string(&inputPath).unwrap();
  serde_json::from_str::<OverallSettings>(&file_settings).unwrap()
  };

 
  if operation == "add" {
    file_settings.file_structure_settings[&language].push(file.to_string());
  }

  // error handling 
  else if file_settings.file_structure_settings[&language].contains(&file.to_string()) {
    if operation == "delete" {
      let file = &file;
      let index = file_settings.file_structure_settings[&language].iter().position(|x| x == file).expect("File not found in list");
      file_settings.file_structure_settings[&language].remove(index);
    }
  }
  else {
    return false;
  }


  std::fs::write(
  inputPath,
  serde_json::to_string_pretty(&file_settings).unwrap()
  ).expect("Bad write to file");

  return true;
}


fn main() {
  tauri::Builder::default()
    // This is where you pass in your commands
    .invoke_handler(tauri::generate_handler![write_file, make_dir, write_to_path_settings, read_settings, read_file_settings, write_file_settings])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}