const { ipcRenderer } = window.require("electron");

export const runTask = (taskId) => {
  return ipcRenderer.invoke("run-task", taskId);
};
