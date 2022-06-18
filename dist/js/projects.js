// global path variable that is used instead of the predefined project paths

import {languages, invoke, Command} from './consts.js'
import {getRoamingPath, readSettings, readfileSettings} from "./settings.js"

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

    //define settings path
    const settings_path = await getRoamingPath();
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
    if ((language == "rust") & (formProps["cargo"] == "on")) {
      const cargo_command = await new Command(
        "cargo-new",
        ["new", formProps["project-name"]],
        { cwd: path }
      )
        .execute()
        .catch(function (err) {
          console.log(err);
        });
      console.log(cargo_command);
      // alert if project not created
      if (cargo_command["code"] == 101) {
        alert(" Cargo project could not be created / Project already exists");
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
      file_create_list = await readfileSettings(
        "javascript",
        settings_path
      ).then();
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
    if ((language == "javascript") & (formProps["react"] == "on")) {
      alert(`React project ${formProps["project-name"]} created at ${path}`);
    }
    // Cargio alert
    else if ((language == "rust") & (formProps["cargo"] == "on")) {
      alert(`Cargo project ${formProps["project-name"]} created at ${path}`);
    }
    //alert that project was made
    else {
      alert(
        `Project ${formProps["project-name"]} was successfully created at the path ${project_path}`
      );
    }
  };
};

let showFiles = function (language) {
  return async function asyncFiles(e) {
    e.preventDefault();
    const settings_path = await getRoamingPath();
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

export {initializeProjectForm, last_path_used, new_path}