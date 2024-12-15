const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
}

app.on("ready", createWindow);

ipcMain.handle("execute-python-script", async (event, scriptName, params) => {
  console.log("scriptName: ",scriptName);
  console.log("params: ",params);
  if (!params || !params.task || !params.folder) {
    return Promise.reject("Faltan parámetros obligatorios (task y folder).");
  }

  const args = [];

  if (params.task) args.push(`--task "${params.task}"`);
  if (params.folder) args.push(`--folder "${params.folder}"`);
  if (params.mode) args.push(`--mode "${params.mode}"`);
  if (params.prefix) args.push(`--prefix "${params.prefix}"`);
  if (params.suffix) args.push(`--suffix "${params.suffix}"`);
  if (params.replace_text) args.push(`--replace_text "${params.replace_text}"`);
  if (params.replace_with) args.push(`--replace_with "${params.replace_with}"`);

  console.log("------------");
  console.log("args: ", args);
  console.log("------------");

  const command = `python "src/python/${scriptName}" ${args.join(" ")}`;

  console.log("Ejecutando comando:", command);

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error ejecutando el script:", error.message);
        reject(error.message);
        return;
      }
      if (stderr) {
        console.error("Error en el script:", stderr);
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
});



// Manejo del diálogo de selección de carpetas
ipcMain.handle("dialog:select-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  return result.filePaths[0]; // Retorna la ruta seleccionada
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
