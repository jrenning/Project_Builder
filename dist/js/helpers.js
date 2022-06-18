/* Other Components*/

import { languages, Command } from "./consts.js";
import {last_path_used} from "./projects.js"

// handling vscode open

function initializeVSCode() {
  const vscode_open = document.querySelectorAll(".vscode-open");
  for (let i = 0; i < vscode_open.length; i++) {
    vscode_open[i].addEventListener("click", openVSCode);
  }
}

async function openVSCode(e) {
  e.preventDefault();
  console.log(last_path_used)
  if (!last_path_used) {
    alert("Project has not been created yet");
    return;
  }
  // open vscode to path of the last created project
  const vscode_open = await new Command("vscode-open", ["-n", last_path_used]).execute().then().catch(function(err) {
        console.log(err)
    })
}


/*Hiding Elements*/

function initializeHides() {
    const trigger_hide = [
      ["react", "javascript"],
      ["cargo", "rust"],
    ];
    for (let i = 0; i < trigger_hide.length; i++) {
      let element = document.getElementById(trigger_hide[i][0]);
      element.addEventListener("click", hideSections(trigger_hide[i][1]));
    }
}



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



export {initializeHides, initializeVSCode}