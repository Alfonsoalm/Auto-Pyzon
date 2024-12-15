const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectFolder: () => ipcRenderer.invoke("dialog:select-folder"),
  selectFile: (filters) => ipcRenderer.invoke("dialog:select-file", filters),
  executePython: (scriptName, params) =>
    ipcRenderer.invoke("execute-python-script", scriptName, params ),
});
