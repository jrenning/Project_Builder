

// With the Tauri global script, enabled when `tauri.conf.json > build > withGlobalTauri` is set to true:
const invoke = window.__TAURI__.invoke
const Command = window.__TAURI__.shell.Command
const open_dir = window.__TAURI__.dialog.open


// create settings file should only happen once 
invoke('write_file', {fileName: 'settings.json' , dir: "C:\\Projects\\Tauri\\test\\"})

// get settings from settings.json
async function readSettings(settingType, language, key) {
    const read_settings = await invoke('read_settings', {key: key, settingType: settingType, language: language}).then().catch(function(err) {
        console.log(err)
    }) 

    return read_settings
}


const sections = document.querySelectorAll('.section')
const sectionButtons = document.querySelectorAll('.controls')
const sectionButton = document.querySelectorAll('.button')
const allSections = document.querySelector('.main-content')
const landing_page = document.querySelector('.landing-page')

// toggle themme 
const themeBtn = document.querySelector('.theme-btn')

themeBtn.addEventListener('click', ()=> {
    let element = document.body;
    element.classList.toggle('light-mode')
})

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




// selector to help show the chosen folder path for 
// existing folder selection, used to check if path
// needs to be changed as well
const chosen_folder_py = document.getElementById('chosen-folder-py')
// global path variable that is used instead of the predefined project paths
let new_path = ''
let last_path_used = ''


const py_submit = document.getElementById('pysubmit')
py_submit.addEventListener("submit", pythonSubmission)


async function pythonSubmission (e) {
    // prevent page refresh
    e.preventDefault()
    // get form data 
    const formData = new FormData(e.target)
    const formProps = Object.fromEntries(formData)
    let path = await readSettings("path", "python", "path")
    console.log(path)

    // checks if other folder was chosen
    if (chosen_folder_py.innerHTML) {
        // makes sure not to set path as a null folder 
        if (chosen_folder_py.innerHTML !== 'Chosen folder: null\\') {
            path = new_path
        }
    }

    // make a directory with the project name 
    invoke('make_dir', {dir: formProps['project-name'], path: path})
    // crate a main.py file in the new directory  
    let project_path = path + formProps['project-name'] + "\\"

    const file_creation = await invoke('write_file', {fileName: 'main.py', dir: project_path}).then().catch(function(err) {
        console.log(err)
    })
    // runs if file already exists 
    if (!file_creation) {
        alert('Project already exists')
        new_path = ''
        return
    }

    // make nev if selected 
    if (formProps['env-setup'] == 'on') {
        console.log('Trying to make env...')
        const env_command  = await new Command("make_env", project_path, {cwd: project_path}).execute().catch(function(err) {
            console.log(err)
        }) 
    }

    // do github actions if they are turned on 
    await githubActions(formProps['git-setup'], formProps['github-link'], project_path)
    // ending message abd cleanup
    endingMessage(formProps['project-name'], project_path)

}

// Javascript submissions 

const js_submit = document.getElementById('jssubmit')
js_submit.addEventListener("submit", javascriptSubmission)

const chosen_folder_js = document.getElementById('chosen-folder-js')


async function javascriptSubmission(e) {
    // prevent page refresh
    e.preventDefault()
    // get form data 
    const formData = new FormData(e.target)
    const formProps = Object.fromEntries(formData)
    let path = 'C:\\Projects\\Javascript\\'

    // checks if other folder was chosen
    if (chosen_folder_js.innerHTML) {
        // makes sure not to set path as a null folder 
        if (chosen_folder_py.innerHTML !== 'Chosen folder: null\\') {
            path = new_path
        }
    }

    // make a directory with the project name 
    invoke('make_dir', {dir: formProps['project-name'], path: path})
    // crate a main.py file in the new directory  
    let project_path = path + formProps['project-name'] + "\\"

    const file_creation = await invoke('write_file', {fileName: 'main.py', dir: project_path}).then().catch(function(err) {
        console.log(err)
    })
    // runs if file already exists 
    if (!file_creation) {
        alert('Project already exists')
        new_path = ''
        return
    }
    invoke('write_file', {fileName: 'index.js', dir: project_path})
    invoke('write_file', {fileName: 'styles.css', dir: project_path})
    invoke('write_file', {fileName: 'styles.scss', dir: project_path})

    // do github actions if they are turned on 
    await githubActions(formProps['git-setup'], formProps['github-link'], project_path)
    endingMessage(formProps['project-name'], project_path)

}


// Helper functions for the different submissions 

async function githubActions(git_setup, github_link, project_path) {
    if (git_setup == 'on') {
        console.log("Trying to set up git...")
        const git_command = await new Command("git", project_path, {cwd: project_path}).execute().catch(function(err) {
            console.log(err)
        })
        invoke('write_file', {fileName: '.gitignore', dir: project_path})
    }
    if (github_link) {
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
}

function endingMessage(project_name, project_path) {
    // set global last path used to path used 
    last_path_used = project_path

    // set new_path back to default 
    new_path = ''

    //alert that project was made 
    alert(`Project ${project_name} was sucsessfully created at the path ${project_path}`)
}

// Handling popup folder selection 
const file_show_py = document.getElementById('folder-existing-py')
file_show_py.addEventListener("click",showFilesPy)

const file_show_js = document.getElementById('folder-existing-js')
file_show_js.addEventListener("click", showFilesJs)



/* Showing file structure*/


async function showFilesPy(e) {
    e.preventDefault()

    let path = 'C:\\Projects\\Python\\'
    let result = await open_dir({defaultPath: path, directory: true, multiple: false}).catch(function(err) {
        console.log(err)
    })
    new_path = result + '\\'
    chosen_folder_py.innerHTML = `Chosen folder: ${new_path}`
}

async function showFilesJs(e) {
    e.preventDefault()

    let path = 'C:\\Projects\\Javascript\\'
    let result = await open_dir({defaultPath: path, directory: true, multiple: false}).catch(function(err) {
        console.log(err)
    })
    new_path = result + '\\'
    chosen_folder_js.innerHTML = `Chosen folder: ${new_path}`
}


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
