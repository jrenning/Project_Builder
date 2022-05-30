
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
    // add trailing slash to go into folder
    result = result + '\\'
    invoke('write_to_path_settings', {key: "python", contents: result, settingType: "path"}).catch(function(err) {
        console.log(err)
    })
}



async function updateSettingsJavascript(e) {
    e.preventDefault()
    path = 'C:/'
    let result = await open_dir({defaultPath: path, directory: true, multiple: false}).catch(function(err) {
        console.log(err)
    })
    // add trailing slash to go into folder
    result = result + '\\'
    invoke('write_to_path_settings', {key: "javascript", contents: result, settingType: "path"}).catch(function(err) {
        console.log(err)
    })
}


