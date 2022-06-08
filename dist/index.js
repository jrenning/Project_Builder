//With the Tauri global script, enabled when `tauri.conf.json > build > withGlobalTauri` is set to true:
const invoke = window.__TAURI__.invoke;
const Command = window.__TAURI__.shell.Command;
const open_dir = window.__TAURI__.dialog.open;
const path_operations = window.__TAURI__.path;
const shell = window.__TAURI__.shell;

// languages supported
const languages = ["python", "javascript", "rust"];

const settings_path = "C:\\Projects\\Tauri\\test\\dist\\settings.json";

/* Basic Settings*/

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
    selector = "settings-submit-" + languages[i];
    settings = document.getElementById(selector);
    settings.addEventListener("submit", updateSettings(languages[i]));
  }

  // set up file updating
  for (let i = 0; i < languages.length; i++) {
    selector = "files-submit-" + languages[i];
    settings = document.getElementById(selector);
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
  let selector = language + "-default";
  let text = await readSettings(settings_path, language, "path");
  console.log(text);
  document.getElementById(selector).innerHTML = "Current Path:" + text;
}

async function displayfileSettings(language) {
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
    path = "C:/";
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

initializeSettings();

/* Transitions and Theme*/

const sections = document.querySelectorAll(".section");
const sectionButtons = document.querySelectorAll(".controls");
const sectionButton = document.querySelectorAll(".button");
const allSections = document.querySelector(".main-content");
const landing_page = document.querySelector(".landing-page");

// toggle theme
const themeBtn = document.querySelector(".theme-btn");

themeBtn.addEventListener("click", () => {
  let element = document.body;
  element.classList.toggle("light-mode");
});

// page transitions
function PageTransitions() {
  allSections.addEventListener("click", (e) => {
    const id = e.target.dataset.id;

    // if back arrow restore page
    if (id == "back-arrow") {
      sections.forEach((section) => {
        section.classList.remove("active");
      });

      //restore landing page
      landing_page.classList.remove("hidden");
      landing_page.classList.add("active");
    }

    if (id) {
      //remove selected from the other buttons
      sectionButtons.forEach((btn) => {
        btn.classList.remove("active");
      });

      //e.target.classList.add('active')

      // hide other sections
      sections.forEach((section) => {
        section.classList.remove("active");
      });

      const element = document.getElementById(id);
      element.classList.add("active");
      // hide all of the buttons
      /*for (let i=0; i<sectionButton.length; i++) {
                sectionButton[i].classList.add('hidden')
            }*/
      // hide the header
      //header.classList.add('hidden')
      landing_page.classList.add("hidden");
      landing_page.classList.remove("active");
    }
  });
}

PageTransitions();

/* Form Submissions*/

// global path variable that is used instead of the predefined project paths
let new_path = "";
let last_path_used = "";

function initializeProjectForm() {
  for (let i = 0; i < languages.length; i++) {
    let submit_form = document.getElementById("submit-" + languages[i]);
    submit_form.addEventListener("submit", ProjectSubmission(languages[i]));
  }
  for (let i = 0; i < languages.length; i++) {
    let folder_show = document.getElementById(
      "folder-existing-" + languages[i]
    );
    folder_show.addEventListener("click", showFiles(languages[i]));
  }
}

// selector to help show the chosen folder path for
// existing folder selection, used to check if path
// needs to be changed as well

let ProjectSubmission = function (language) {
  return async function asyncSubmission(e) {
    e.preventDefault();
    // get form data
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    // get default path from settings
    let path = await readSettings(settings_path, language, "path");

    let selector = "chosen-folder-" + language;
    const chosen_folder = document.getElementById(selector);

    if (chosen_folder.innerHTML) {
      // makes sure not to set path as a null folder
      if (chosen_folder.innerHTML !== "Chosen folder: null\\") {
        path = new_path;
      }
    }

    // checks for javascript language to avoid key error on react
    if (language == "javascript") {
      if (formProps["react"] == "on") {
        // make sure npm rules are followed
        const upperCase = (string) => /[A-Z]/.test(string);
        if (upperCase(formProps["project-name"])) {
          alert("Project name must not contain a capital letter (npm rules)");
          return;
        }

        const react_command = await new Command(
          "react-app",
          ["create-react-app", formProps["project-name"]],
          { cwd: path }
        )
          .execute()
          .catch(function (err) {
            console.log(err);
          });
        console.log(react_command);

        // alert if project not created
        if (typeof react_command == "undefined") {
          alert(
            "Project could not be created, check internet connection and make sure npm is installed in the default area"
          );
          return;
        }
          
      }
    }

    // crete cargo project if in rust 
    if (language =="rust" & formProps['cargo'] == 'on') {
      const cargo_command = await new Command(
        "cargo-new",
        ["new", formProps["project-name"]],
        { cwd: path }
      )
        .execute()
        .catch(function (err) {
          console.log(err);
        });
        console.log(cargo_command)
      // alert if project not created
      if (cargo_command['code'] == 101) {
        alert(
          " Cargo project could not be created / Project already exists"
        );
        return;
      }
    }

    // make a directory with the project name
    invoke("make_dir", { dir: formProps["project-name"], path: path });
    // create a file in the new directory
    let project_path = path + formProps["project-name"] + "\\";

    let file_create_list = [];

    if (language == "python") {
      file_create_list = await readfileSettings("python", settings_path).then();
    }
    if (language == "javascript") {
      file_create_list = await readfileSettings("javascript",settings_path).then();
    }

    if (language == "rust") {
      file_create_list = await readfileSettings("rust", settings_path).then();
    }

    console.log(file_create_list);
    for (let i = 0; i < file_create_list.length; i++) {
      let file_creation = await invoke("write_file", {
        fileName: file_create_list[i],
        dir: project_path,
      })
        .then()
        .catch(function (err) {
          console.log(err);
        });
      // on first pass check for duplicate file, break
      if (i == 0) {
        // runs if file already exists
        if (!file_creation) {
          alert("Project already exists");
          new_path = "";
          return;
        }
      }
    }
    // if python make env (if selected as an option)
    // make nev if selected
    if (formProps["env-setup"] == "on") {
      console.log("Trying to make env...");
      const env_command = await new Command("make_env", project_path, {
        cwd: project_path,
      })
        .execute()
        .catch(function (err) {
          console.log(err);
        });
    }
    if (formProps["git-setup"] == "on") {
      console.log("Trying to set up git...");
      const git_command = await new Command("git", project_path, {
        cwd: project_path,
      })
        .execute()
        .catch(function (err) {
          console.log(err);
        });
      invoke("write_file", { fileName: ".gitignore", dir: project_path });
    }
    if (formProps["github-link"]) {
      console.log("Trying to connect to github...");
      const git_add_command = await new Command("git-add-all", ["add", "."], {
        cwd: project_path,
      })
        .execute()
        .catch(function (err) {
          console.log(err);
        });
      console.log("Added files to git...");

      const git_commit_command = await new Command(
        "git-commit",
        ["commit", "-m", "Initial commit"],
        { cwd: project_path }
      )
        .execute()
        .catch(function (err) {
          console.log(err);
        });
      console.log("Committed files to git...");

      const git_branch_command = await new Command(
        "github-branch-rename",
        ["branch", "-M", "main"],
        { cwd: project_path }
      )
        .execute()
        .catch(function (err) {
          console.log(err);
        });
      console.log("Renamed master branch to main...");

      const git_connect_command = await new Command(
        "github-link",
        ["remote", "add", "origin", github_link],
        { cwd: project_path }
      )
        .execute()
        .catch(function (err) {
          console.log(err);
        });
      console.log("Connected repository to github...");
      const git_push_initial = await new Command(
        "github-push-initial",
        ["push", "-u", "origin", "main"],
        { cwd: project_path }
      )
        .execute()
        .catch(function (err) {
          console.log(err);
        });
      console.log("Pushed initial commit to github...");
    }
    // set global last path used to path used
    last_path_used = project_path;

    // set new_path back to default
    new_path = "";

    // React alert 
    if (language == "javascript" & formProps['react'] == 'on') {
      alert(`React project ${formProps["project-name"]} created at ${path}`);
    }
    // Cargio alert
    else if (language == "rust" & formProps['cargo'] == 'on') {
      alert(`Cargo project ${formProps["project-name"]} created at ${path}`);
    }
    //alert that project was made
    else {
      alert(`Project ${formProps["project-name"]} was successfully created at the path ${project_path}`)
    };
  };
};

let showFiles = function (language) {
  return async function asyncFiles(e) {
    e.preventDefault();
    let path = await readSettings(settings_path, language, "path");
    let result = await open_dir({
      defaultPath: path,
      directory: true,
      multiple: false,
    }).catch(function (err) {
      console.log(err);
    });
    new_path = result + "\\";
    let selector = "chosen-folder-" + language;
    let chosen_folder = document.getElementById(selector);

    chosen_folder.innerHTML = `Chosen folder: ${new_path}`;
  };
};

initializeProjectForm();

/* Other Components*/

// handling vscode open

const vscode_open = document.querySelectorAll(".vscode-open");
for (let i = 0; i < vscode_open.length; i++) {
  vscode_open[i].addEventListener("click", openVSCode);
}

async function openVSCode(e) {
  e.preventDefault();
  if (!last_path_used) {
    alert("Project has not been created yet");
    return;
  }
  // open vscode to path of the last created project
  /*const vscode_open = await new Command("vscode-open", ["-n", last_path_used]).execute().then().catch(function(err) {
        console.log(err)
    })*/
  const vscode_open = await new Command("vscode-open", ["-n", last_path_used]);
  console.log(vscode_open);
  console.log(vscode_open.execute());
}


/*Hiding Elements*/

const trigger_hide = [['react', "javascript"], ['cargo', "rust"]]

let hideSections = function (language) {
  return function hiddenStuff(e) {
    let selector = "git-setup-" + language;
    let hidden_element = document.getElementById(selector);
    if (hidden_element.classList.contains("hidden")) {
      hidden_element.classList.remove("hidden");
    } else {
      hidden_element.classList.add("hidden");
    }
  };
};


for(let i=0; i<trigger_hide.length; i++) {
  let element = document.getElementById(trigger_hide[i][0])
  element.addEventListener("click", hideSections(trigger_hide[i][1]))
}



