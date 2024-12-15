import React, { useState } from "react";
import "../styles/FolderView.css";

export const FolderView = () => {
  const [task, setTask] = useState("organize");
  const [folderPath, setFolderPath] = useState("");
  const [message, setMessage] = useState(""); // Estado para el mensaje
  const [messageType, setMessageType] = useState(""); // "success" o "error"

  // Estados específicos para la tarea "rename"
  const [renameParams, setRenameParams] = useState({
    mode: "sequential",
    prefix: "",
    suffix: "",
    replace_text: "",
    replace_with: "",
  });

  const handleTaskChange = (e) => {
    setTask(e.target.value);
    setMessage(""); // Limpiar mensajes al cambiar de tarea
    setMessageType("");
  };

  const handleSelectFolder = async () => {
    const folder = await window.api.selectFolder();
    if (folder) setFolderPath(folder);
  };

  const handleRenameParamChange = (e) => {
    const { name, value } = e.target;
    setRenameParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleExecuteTask = async () => {
    if (!folderPath) {
      setMessage("Por favor, selecciona una carpeta.");
      setMessageType("error");
      return;
    }

    const params = {
      task,
      folder: folderPath,
    };

    // Agregar parámetros específicos para la tarea "rename"
    if (task === "rename") {
      params.mode = renameParams.mode;
      params.prefix = renameParams.prefix;
      params.suffix = renameParams.suffix;
      params.replace_text = renameParams.replace_text;
      params.replace_with = renameParams.replace_with;
    }

    try {
      const result = await window.api.executePython("file_manager.py", params);
      setMessage(result);
      setMessageType("success");
    } catch (error) {
      console.error("Error ejecutando el script:", error);
      setMessage("Ocurrió un error al ejecutar la tarea.");
      setMessageType("error");
    }
  };

  return (
    <div className="view-container">
      <h2>Gestión de Archivos y Carpetas</h2>

      <div>
        <label htmlFor="task-select">Selecciona una tarea:</label>
        <select id="task-select" onChange={handleTaskChange} value={task}>
          <option value="organize">Organizar Archivos</option>
          <option value="duplicates">Eliminar Duplicados</option>
          <option value="rename">Renombrar Archivos</option>
        </select>
      </div>

      <div>
        <button onClick={handleSelectFolder}>Seleccionar Carpeta</button>
        {folderPath && <p>Carpeta seleccionada: {folderPath}</p>}
      </div>

      {/* Mostrar campos adicionales para la tarea "rename" */}
      {task === "rename" && (
        <div className="rename-options">
          <h3>Opciones para Renombrar:</h3>
          <div>
            <label htmlFor="mode">Modo:</label>
            <select
              id="mode"
              name="mode"
              value={renameParams.mode}
              onChange={handleRenameParamChange}
            >
              <option value="sequential">Secuencial</option>
              <option value="creation_date">Fecha de Creación</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              id="prefix"
              name="prefix"
              placeholder="Prefijo"
              value={renameParams.prefix}
              onChange={handleRenameParamChange}
            />
          </div>
          <div>
            <input
              type="text"
              id="suffix"
              name="suffix"
              placeholder="Sufijo"
              value={renameParams.suffix}
              onChange={handleRenameParamChange}
            />
          </div>
          <div>
            <input
              type="text"
              id="replace_text"
              name="replace_text"
              placeholder="Reemplazar Texto"
              value={renameParams.replace_text}
              onChange={handleRenameParamChange}
            />
          </div>
          <div>
            <input
              type="text"
              id="replace_with"
              name="replace_with"
              placeholder="Reemplazar Por"
              value={renameParams.replace_with}
              onChange={handleRenameParamChange}
            />
          </div>
        </div>
      )}

      <button onClick={handleExecuteTask}>Ejecutar Tarea</button>

      {/* Mostrar mensaje dinámico */}
      {message && (
        <p className={`message ${messageType}`}>
          {message}
        </p>
      )}
    </div>
  );
};
