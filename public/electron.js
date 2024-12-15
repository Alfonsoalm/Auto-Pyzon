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
  console.log("scriptName: ", scriptName);
  console.log("params: ", params);

  if (!scriptName) {
    return Promise.reject("El nombre del script es obligatorio.");
  }

  // Rutas dinámicas de los scripts
  const scriptPath = path.join(`src/python/${scriptName}`);

  // Validación y generación de argumentos según el script
  const generateArgs = () => {
    const args = [];

    switch (scriptName) {
      case "file_manager.py":
        if (!params.task || !params.folder) {
          throw new Error("Faltan parámetros obligatorios (task y folder) para file_manager.py.");
        }

        args.push(`--task "${params.task}"`);
        args.push(`--folder "${params.folder}"`);

        if (params.mode) args.push(`--mode "${params.mode}"`);
        if (params.prefix) args.push(`--prefix "${params.prefix}"`);
        if (params.suffix) args.push(`--suffix "${params.suffix}"`);
        if (params.replace_text) args.push(`--replace_text "${params.replace_text}"`);
        if (params.replace_with) args.push(`--replace_with "${params.replace_with}"`);
        break;

      case "pdf_manager.py":
        if (params.task === "merge_folder") {
          if (!params.folder) {
            throw new Error("Falta el parámetro folder para merge_folder en pdf_manager.py.");
          }
          args.push(`--task "merge_folder"`);
          args.push(`--folder "${params.folder}"`);
        } else if (params.task === "merge_pages") {
          if (!params.input_pdf || !params.page_list) {
            throw new Error("Faltan parámetros obligatorios (input_pdf y page_list) para merge_pages en pdf_manager.py.");
          }
          args.push(`--task "merge_pages"`);
          args.push(`--input_pdf "${params.input_pdf}"`);
          args.push(`--page_list "${params.page_list}"`);
        } else {
          throw new Error("Tarea no válida para pdf_manager.py. Use 'merge_folder' o 'merge_pages'.");
        }
        break;

      default:
        throw new Error(`Script desconocido: ${scriptName}`);
    }

    return args;
  };

  // Generar los argumentos del script
  let args;
  try {
    args = generateArgs();
  } catch (error) {
    console.error(error.message);
    return Promise.reject(error.message);
  }

  // Construir el comando final
  const command = `python "${scriptPath}" ${args.join(" ")}`;
  console.log("Ejecutando comando:", command);

  // Ejecutar el comando y devolver el resultado
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
      resolve(stdout.trim());
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

// Seleccionar Archivo
ipcMain.handle("dialog:select-file", async (event, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: filters ? [{ name: "Files", extensions: filters }] : undefined,
  });
  return result.filePaths[0];
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
