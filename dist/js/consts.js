//With the Tauri global script, enabled when `tauri.conf.json > build > withGlobalTauri` is set to true:
const invoke = window.__TAURI__.invoke;
const Command = window.__TAURI__.shell.Command;
const open_dir = window.__TAURI__.dialog.open;
const path_operations = window.__TAURI__.path;
const shell = window.__TAURI__.shell;

// languages supported
const languages = ["python", "javascript", "rust"];


export {invoke, Command, open_dir, path_operations, shell, languages}
