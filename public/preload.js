const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectFolder: () => ipcRenderer.invoke("dialog:select-folder"),
  executePython: (scriptName, params) =>
    ipcRenderer.invoke("execute-python-script", scriptName, params ),
});
