

// With the Tauri global script, enabled when `tauri.conf.json > build > withGlobalTauri` is set to true:
const invoke = window.__TAURI__.invoke
const Command = window.__TAURI__.shell.Command
const open_dir = window.__TAURI__.dialog.open

// languages supported 
const languages = ["python", "javascript"]



/* Basic Settings*/


function initializeSettings() {
    // create settings file should only happen once 
    invoke('write_file', {fileName: 'settings.json' , dir: "C:\\Projects\\Tauri\\test\\"})

    // initial display of path settings
    for (let i=0; i<languages.length; i++) {
        displayPathSettings(languages[i])
    }
    // set up updating 
    for (let i=0; i<languages.length; i++) {
        selector = "settings-submit-" + languages[i]
        settings = document.getElementById(selector)
        settings.addEventListener("submit", updateSettings(languages[i]))
    }
}


// get settings from settings.json
async function readSettings(settingType, language, key) {
    const read_settings = await invoke('read_settings', {key: key, settingType: settingType, language: language}).then().catch(function(err) {
        console.log(err)
    }) 

    return read_settings
}

// display current path settings 
async function displayPathSettings(language) {
    let selector = language + '-default'
    let text = await readSettings("path", language, "path")
    document.getElementById(selector).innerHTML = 'Current Path:' + text
}

// update settings based on language selected
let updateSettings = function(language) {
    return async function asyncSettings(e) {
        e.preventDefault()
        path = 'C:/'
        let result = await open_dir({defaultPath: path, directory: true, multiple: false}).catch(function(err) {
            console.log(err)
        })
        // go into the directory
        result = result + "\\"
        // update path settings
        invoke('write_to_path_settings', {language: language, contents: result, settingType: "path", key: "path"}).catch(function(err) {
            console.log(err)
        })
        displayPathSettings(language)
    }
}

initializeSettings()

/* Transitions and Theme*/



const sections = document.querySelectorAll('.section')
const sectionButtons = document.querySelectorAll('.controls')
const sectionButton = document.querySelectorAll('.button')
const allSections = document.querySelector('.main-content')
const landing_page = document.querySelector('.landing-page')

// toggle theme 
const themeBtn = document.querySelector('.theme-btn')

themeBtn.addEventListener('click', ()=> {
    let element = document.body;
    element.classList.toggle('light-mode')
})

// page transitions
function PageTransitions () {
    allSections.addEventListener('click', (e) => {
        const id = e.target.dataset.id;

        // if back arrow restore page
        if (id == 'back-arrow') {
            console.log('back-arrow')

            sections.forEach((section)=>{
                section.classList.remove('active')
            })

            //restore landing page 
            landing_page.classList.remove('hidden')
            landing_page.classList.add('active')
            
        }



        if (id) {
            //remove selected from the other buttons
            sectionButtons.forEach((btn) => {
                btn.classList.remove('active')
            })

            //e.target.classList.add('active')

            // hide other sections 
            sections.forEach((section)=>{
                section.classList.remove('active')
            })

            const element = document.getElementById(id)
            element.classList.add('active')
            // hide all of the buttons
            /*for (let i=0; i<sectionButton.length; i++) {
                sectionButton[i].classList.add('hidden')
            }*/
            // hide the header
            //header.classList.add('hidden')
            landing_page.classList.add('hidden')
            landing_page.classList.remove('active')

            
        }
    })
}

PageTransitions()




/* Form Submissions*/

// global path variable that is used instead of the predefined project paths
let new_path = ''
let last_path_used = ''

function initializeProjectForm() {
    for(let i=0; i<languages.length; i++) {
        let submit_form = document.getElementById('submit-' + languages[i])
        submit_form.addEventListener("submit", ProjectSubmission(languages[i]))
    }
    for(let i=0; i<languages.length; i++) {
        let folder_show = document.getElementById('folder-existing-' + languages[i])
        folder_show.addEventListener("click", showFiles(languages[i]))
    }

}


// selector to help show the chosen folder path for 
// existing folder selection, used to check if path
// needs to be changed as well

let ProjectSubmission  = function(language) {
    return async function asyncSubmission(e) {
        e.preventDefault()
        // get form data 
        const formData = new FormData(e.target)
        const formProps = Object.fromEntries(formData)
        // get default path from settings
        let path = await readSettings("path", language, "path")

        let selector = "chosen-folder-" + language
        const chosen_folder = document.getElementById(selector)

        if (chosen_folder.innerHTML) {
            // makes sure not to set path as a null folder 
            if (chosen_folder.innerHTML !== 'Chosen folder: null\\') {
                path = new_path
            }
        }
        console.log(language)
        // checks for javascript language to avoid key error on react
        if (language == "javascript") {
            if (formProps['react'] == 'on') {

                // make sure npm rules are followed 
                const upperCase = (string) => /[A-Z]/.test(string)
                if (upperCase(formProps['project-name'])) {
                    alert('Project name must not contain a capital letter (npm rules)')
                    return
                }

                const react_command  = await new Command("react-app", ["create-react-app", formProps['project-name']], {cwd: path}).execute().catch(function(err) {
                console.log(err)
                })
                console.log(react_command)
 
 
                // alert if project not created 
                if (typeof react_command == 'undefined') {
                    alert('Project could not be created, check internet connection and make sure npm is installed in the default area')
                    return
                }
                // send message and stop loop as everything else is handled by react
                alert(`React project ${formProps['project-name']} created at ${path}`)
                return
            }
        }
        // make a directory with the project name 
        invoke('make_dir', {dir: formProps['project-name'], path: path})
        // create a file in the new directory  
        let project_path = path + formProps['project-name'] + "\\"

        let file_create_list = []

        if (language == "python") {
            file_create_list.push("main.py")
        }
        if (language == "javascript") {
            file_create_list.push("index.js", "index.css", "index.html", "index.scss")
        }
        for (let i=0; i<file_create_list.length; i++) {
            let file_creation = await invoke('write_file', {fileName: file_create_list[i], dir: project_path}).then().catch(function(err) {
                console.log(err)
            })
            // on first pass check for duplicate file, break 
            if (i == 0) {
                // runs if file already exists 
                if (!file_creation) {
                    alert('Project already exists')
                    new_path = ''
                    return
                }
            }

        }
        // if python make env (if selected as an option)
            // make nev if selected 
        if (formProps['env-setup'] == 'on') {
            console.log('Trying to make env...')
            const env_command  = await new Command("make_env", project_path, {cwd: project_path}).execute().catch(function(err) {
                console.log(err)
            }) 
        }
        if (formProps['git-setup'] == 'on') {
        console.log("Trying to set up git...")
        const git_command = await new Command("git", project_path, {cwd: project_path}).execute().catch(function(err) {
            console.log(err)
        })
        invoke('write_file', {fileName: '.gitignore', dir: project_path})
        }
        if (formProps['github-link']) {
            console.log('Trying to connect to github...')
            const git_add_command = await new Command("git-add-all", ['add', '.'], {cwd: project_path}).execute().catch(function(err) {
                console.log(err)
            })
            console.log('Added files to git...')

            const git_commit_command = await new Command("git-commit", ['commit', '-m', 'Initial commit'], {cwd: project_path}).execute().catch(function(err) {
                console.log(err)
            })
            console.log("Committed files to git...")

            const git_branch_command = await new Command("github-branch-rename", ['branch', '-M', 'main'], {cwd: project_path}).execute().catch(function(err) {
                console.log(err)
            })
            console.log("Renamed master branch to main...")

            const git_connect_command = await new Command("github-link", ['remote', 'add', 'origin', github_link], {cwd: project_path}).execute().catch(function(err) {
                console.log(err)
            })
            console.log("Connected repository to github...")
            const git_push_initial = await new Command("github-push-initial", ['push', '-u', 'origin', 'main'], {cwd: project_path}).execute().catch(function(err) {
                console.log(err)
            })
            console.log("Pushed initial commit to github...")
        }
        // set global last path used to path used 
        last_path_used = project_path

        // set new_path back to default 
        new_path = ''

        //alert that project was made 
        alert(`Project ${formProps['project-name']} was successfully created at the path ${project_path}`)

    }
}

let showFiles = function(language) {
    return async function asyncFiles(e) {
        e.preventDefault()
        let path = await readSettings("path", language, "path")
        let result = await open_dir({defaultPath: path, directory: true, multiple: false}).catch(function(err) {
            console.log(err)
        })
        new_path = result + '\\'
        let selector = 'chosen-folder-' + language
        let chosen_folder = document.getElementById(selector)

        chosen_folder.innerHTML = `Chosen folder: ${new_path}`


    }
}

initializeProjectForm()



/* Other Components*/



// handling vscode open 

const vscode_open = document.querySelectorAll('.vscode-open')
for (let i=0; i<vscode_open.length; i++) {
    vscode_open[i].addEventListener("click", openVSCode)
}

async function openVSCode(e) {
    e.preventDefault()
    if (!last_path_used) {
        alert("Project has not been created yet")
        return 
    }
    // open vscode to path of the last created project 
    const vscode_open = await new Command("vscode-open", ["-n", last_path_used]).execute().catch(function(err) {
        console.log(err)
    })
}

// handling react hide 
const react = document.getElementById('react')
react.addEventListener("click", hideGit)

function hideGit() {
    const git_setup = document.querySelector('.git-setup')
    console.log(git_setup)
    if (git_setup.classList.contains('hidden')) {
        git_setup.classList.remove('hidden')
    }
    else {
        git_setup.classList.add('hidden')
    }   
}
