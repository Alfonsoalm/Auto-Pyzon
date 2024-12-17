const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

// Configuración para el archivo de log
const logFilePath = path.join(app.getPath("userData"), "app.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

function logToFile(message) {
  logStream.write(`${new Date().toISOString()} - ${message}\n`);
}

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

  mainWindow.loadURL(`file://${path.join(__dirname, "../build/index.html")}`);
}

app.on("ready", createWindow);

// Ajuste de rutas según el modo (desarrollo o empaquetado)
const isPackaged = app.isPackaged;
const pythonPath = isPackaged
  ? path.join(process.resourcesPath, "app", "python_env", "python.exe").replace(/\\/g, "\\\\")
  : path.join(__dirname, "python_env", "python.exe").replace(/\\/g, "\\\\");
logToFile(`Python path: ${pythonPath}`);

ipcMain.handle("execute-python-script", async (event, scriptName, params) => {
  logToFile(`scriptName: ${scriptName}`);
  logToFile(`params: ${JSON.stringify(params)}`);

  if (!scriptName) {
    return Promise.reject("El nombre del script es obligatorio.");
  }

  // Ruta al script de Python
  const scriptPath = isPackaged
    ? path.join(process.resourcesPath, "app", "src", "python", scriptName).replace(/\\/g, "\\\\") // 
    : path.join(__dirname, "src", "python", scriptName).replace(/\\/g, "\\\\"); 
  logToFile(`Script path: ${scriptPath}`);

  // Validamos que el script existe
  if (!fs.existsSync(scriptPath)) {
    logToFile(`Script file does not exist at path: ${scriptPath}`);
    console.log("Script");
    return Promise.reject(`Script file does not exist at path: ${scriptPath}`);
  }

  // Generación de argumentos dinámicos
  const generateArgs = () => {
    const args = [];
    switch (scriptName) {
      case "file_manager.py":
        if (!params.task || !params.folder) {
          throw new Error("Faltan parámetros obligatorios (task y folder) para file_manager.py.");
        }
        args.push(`--task "${params.task}"`);
        args.push(`--folder "${path.normalize(params.folder).replace(/\\/g, "\\\\")}"`);
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
          args.push(`--folder "${path.normalize(params.folder).replace(/\\/g, "\\\\")}"`);
        } else if (params.task === "merge_pages") {
          if (!params.input_pdf || !params.page_list) {
            throw new Error("Faltan parámetros obligatorios (input_pdf y page_list) para merge_pages en pdf_manager.py.");
          }
          args.push(`--task "merge_pages"`);
          args.push(`--input_pdf "${params.input_pdf.replace(/\\/g, "\\\\")}"`);
          args.push(`--page_list "${params.page_list}"`);
        } else {
          throw new Error("Tarea no válida para pdf_manager.py. Use 'merge_folder' o 'merge_pages'.");
        }
        break;

      case "email_manager.py":
        if (!params.username || !params.password) {
          throw new Error("Faltan credenciales (username y password) para email_manager.py.");
        }
        args.push(`--task "${params.task}"`);
        args.push(`--username "${params.username}"`);
        args.push(`--password "${params.password}"`);
        if (params.task === "send_email") {
          if (!params.to_email || !params.subject || !params.message) {
            throw new Error("Faltan parámetros obligatorios para enviar un correo.");
          }
          args.push(`--to_email "${params.to_email}"`);
          args.push(`--subject "${params.subject}"`);
          args.push(`--message "${params.message}"`);
        } else if (params.task === "read_emails") {
          if (!params.number_emails || !params.save_path || !params.format) {
            throw new Error("Faltan parámetros obligatorios para leer correos.");
          }
          args.push(`--number_emails "${params.number_emails}"`);
          args.push(`--save_path "${params.save_path.replace(/\\/g, "\\\\")}"`);
          args.push(`--format "${params.format}"`);
        }
        break;

      case "powerpoint_generator.py":
        if (!params.task || !params.folder) {
          throw new Error("Faltan parámetros obligatorios (task y folder) para powerpoint_generator.py.");
        }
        args.push(`--task "${params.task}"`);
        const normalizedFolderPath = path.normalize(params.folder).replace(/\\/g, "\\\\");
        if (!fs.existsSync(params.folder)) {
          logToFile(`Folder does not exist at path: ${params.folder}`);
          throw new Error(`Folder does not exist at path: ${params.folder}`);
        }
        args.push(`--folder "${normalizedFolderPath}"`);
        logToFile(`FolderPath: ${params.folder}`);
        logToFile(`Normalized FolderPath: ${normalizedFolderPath}`);
        if (params.output_file) {
          args.push(`--output_file "${params.output_file.replace(/\\/g, "\\\\")}"`);
        }
        break;

      case "word_generator.py":
        if (!params.task || !params.folder) {
          throw new Error("Faltan parámetros obligatorios (task y folder) para word_manager.py.");
        }
        args.push(`--task "${params.task}"`);
        args.push(`--folder "${path.normalize(params.folder).replace(/\\/g, "\\\\")}"`);
        if (params.output_file) {
          args.push(`--output_file "${params.output_file.replace(/\\/g, "\\\\")}"`);
        }
        if (params.output_format) {
          args.push(`--output_format "${params.output_format}"`);
        }
        break;

      default:
        throw new Error(`Script desconocido: ${scriptName}`);
    }
    return args;
  };

  let args;
  try {
    args = generateArgs();
  } catch (error) {
    logToFile(`Error generando argumentos: ${error.message}`);
    return Promise.reject(error.message);
  }

  const command = `"${pythonPath}" "${scriptPath}" ${args.join(" ")}`;
  logToFile(`Comando final: ${command}`);

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logToFile(`Error ejecutando el script: ${error.message}`);
        reject(error.message);
        return;
      }
      if (stderr) {
        logToFile(`Error en el script: ${stderr}`);
        reject(stderr);
        return;
      }
      resolve(stdout.trim());
    });
  });
});

// Manejadores para diálogos
ipcMain.handle("dialog:select-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  return result.filePaths[0];
});

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
