
import {languages, invoke, open_dir, path_operations} from "./consts.js"

// dev path for settings
//const settings_path = "C:\\Projects\\Tauri\\test\\dist\\settings.json";
async function getRoamingPath() {
  const data = await path_operations
    .dataDir()
    .then()
    .catch(function (err) {
      console.log(err);
    });

  return data + "Project Builder\\_up_\\settings.json";
}


function initializeSettings() {
  //create settings file should only happen once
  invoke("write_file", {
    fileName: "settings.json",
    dir: "C:\\Projects\\Tauri\\test\\",
  });

  // initial display of path settings
  for (let i = 0; i < languages.length; i++) {
    displayPathSettings(languages[i]);
  }

  //initial display of file settings
  for (let i = 0; i < languages.length; i++) {
    displayfileSettings(languages[i]);
  }

  // set up updating
  for (let i = 0; i < languages.length; i++) {
    let selector = "settings-submit-" + languages[i];
    let settings = document.getElementById(selector);
    settings.addEventListener("submit", updateSettings(languages[i]));
  }

  // set up file updating
  for (let i = 0; i < languages.length; i++) {
    let selector = "files-submit-" + languages[i];
    let settings = document.getElementById(selector);
    settings.addEventListener("submit", updatefileSettings(languages[i]));
  }
}

// get settings from settings.json
async function readSettings(input_path, language, key) {
  const read_settings = await invoke("read_settings", {
    key: key,
    inputPath: input_path,
    language: language,
  })
    .then()
    .catch(function (err) {
      console.log(err);
    });

  return read_settings;
}

async function readfileSettings(language, input_path) {
  const read_files = await invoke("read_file_settings", {
    language: language,
    inputPath: input_path,
  })
    .then()
    .catch(function (err) {
      console.log(err);
    });

  return read_files;
}

let updatefileSettings = function (language) {
  return async function asyncFileSet(e) {
    e.preventDefault();
    const settings_path = await getRoamingPath();
    console.log(settings_path);

    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    let files_input = formProps["file-setting"];

    // split up entries in the form
    let files = files_input.split(",");

    // sets operation for the update
    let operation = "add";
    if (formProps["delete-file"] == "on") {
      operation = "delete";
    }

    for (let i = 0; i < files.length; i++) {
      files[i] = files[i].trim();
      let result = await invoke("write_file_settings", {
        language: language,
        inputPath: settings_path,
        operation: operation,
        file: files[i],
      })
        .then()
        .catch(function (err) {
          console.log(err);
        });
      console.log(result);
      if (!result) {
        alert("One of the files does not exist");
        return;
      }
    }
    displayfileSettings(language);
  };
};

// display current path settings
async function displayPathSettings(language) {
  const settings_path = await getRoamingPath();
  let selector = language + "-default";
  let text = await readSettings(settings_path, language, "path");
  console.log(text);
  document.getElementById(selector).innerHTML = "Current Path:" + text;
}

async function displayfileSettings(language) {
  const settings_path = await getRoamingPath();
  let selector = language + "-files";
  let text = await readfileSettings(language, settings_path);
  document.getElementById(selector).innerHTML = "Current Files:";
  for (let i = 0; i < text.length; i++) {
    document.getElementById(selector).innerHTML += text[i] + "," + " ";
  }
}

// update settings based on language selected
let updateSettings = function (language) {
  return async function asyncSettings(e) {
    e.preventDefault();
    const settings_path = await getRoamingPath();
    let path = "C:/";
    let result = await open_dir({
      defaultPath: path,
      directory: true,
      multiple: false,
    }).catch(function (err) {
      console.log(err);
    });
    // go into the directory
    result = result + "\\";
    // update path settings
    invoke("write_to_path_settings", {
      language: language,
      contents: result,
      inputPath: settings_path,
      key: "path",
    });
    displayPathSettings(language);
  };
};

export {initializeSettings, readSettings, readfileSettings, getRoamingPath}