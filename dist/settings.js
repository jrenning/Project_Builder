
/* Basic Settings*/


// Python settings 
settings = document.querySelector('#settings-submit-python')
settings.addEventListener("submit", updateSettingsPython)

// Javascript settings
settings = document.querySelector('#settings-submit-javascript')
settings.addEventListener("submit", updateSettingsJavascript)


async function updateSettingsPython(e) {
    e.preventDefault()
    path = 'C:/'
    let result = await open_dir({defaultPath: path, directory: true, multiple: false}).catch(function(err) {
        console.log(err)
    })
    // go into the directory
    result = result + "\\"
    // update path settings
    invoke('write_to_path_settings', {language: "python", contents: result, settingType: "path", key: "path"}).catch(function(err) {
        console.log(err)
    })
    displayPathSettings("python")
    displayPathSettings("javascript")
}



async function updateSettingsJavascript(e) {
    e.preventDefault()
    path = 'C:/'
    let result = await open_dir({defaultPath: path, directory: true, multiple: false}).catch(function(err) {
        console.log(err)
    })
    // add trailing slash to go into folder
    result = result + '\\'
    // update path settings
    invoke('write_to_path_settings', {key: "path", contents: result, settingType: "path", langauge: "javascript"}).catch(function(err) {
        console.log(err)
    })
    
    displayPathSettings("python")
    displayPathSettings("javascript")
}


