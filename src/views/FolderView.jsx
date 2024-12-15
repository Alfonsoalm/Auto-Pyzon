import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FolderView.css";

export const FolderView = () => {
  const navigate = useNavigate();
  const [task, setTask] = useState("organize");
  const [folderPath, setFolderPath] = useState("");
  const [message, setMessage] = useState(""); // Estado para el mensaje
  const [messageType, setMessageType] = useState(""); // "success" o "error"

  const handleTaskChange = (e) => setTask(e.target.value);

  const handleSelectFolder = async () => {
    const folder = await window.api.selectFolder();
    if (folder) setFolderPath(folder);
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
  
    if (task === "rename") {
      params.mode = "sequential"; // Ajusta según necesidad
      params.prefix = "archivo_"; // Ejemplo de prefijo
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
          <option value="duplicates">Buscar Duplicados</option>
          <option value="rename">Renombrar Archivos</option>
        </select>
      </div>

      <div>
        <button onClick={handleSelectFolder}>Seleccionar Carpeta</button>
        {folderPath && <p>Carpeta seleccionada: {folderPath}</p>}
      </div>

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
