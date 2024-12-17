import React, { useState } from "react";
import "../styles/PowerPointView.css";

export const PowerPointView = () => {
  const [task, setTask] = useState("create_presentation_with_images");
  const [folderPath, setFolderPath] = useState("");
  const [outputFile, setOutputFile] = useState("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // Estado para la barra de carga

  const handleSelectFolder = async () => {
    const folder = await window.api.selectFolder();
    if (folder) setFolderPath(folder);
  };

  const handleExecuteTask = async () => {
    if (!folderPath) {
      setMessage("Por favor, selecciona una carpeta con imágenes.");
      return;
    }

    setIsProcessing(true); // Mostrar la barra de carga
    setMessage(""); // Limpiar mensajes anteriores

    const params = {
      task,
      folder: folderPath,
      output_file: outputFile,
    };

    try {
      const result = await window.api.executePython("powerpoint_generator.py", params);
      setMessage(result);
    } catch (error) {
      setMessage("Error: " + error);
    } finally {
      setIsProcessing(false); // Ocultar la barra de carga
    }
  };

  return (
    <div className="view-container">
      <h2>Gestión de Documentos PowerPoint</h2>

      <div className="powerpoint-form">
        <label htmlFor="task-select">Selecciona una tarea:</label>
        <select
          id="task-select"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          disabled={isProcessing}
        >
          <option value="create_presentation_with_images">Crear Presentación con Imágenes</option>
          {/* Más tareas pueden añadirse aquí */}
        </select>

        <button onClick={handleSelectFolder} disabled={isProcessing}>
          {isProcessing ? "Procesando..." : "Seleccionar Carpeta de Imágenes"}
        </button>
        {folderPath && <p>Carpeta seleccionada: {folderPath}</p>}

        <input
          type="text"
          placeholder="Nombre del archivo de salida (opcional)"
          value={outputFile}
          onChange={(e) => setOutputFile(e.target.value)}
          disabled={isProcessing}
        />

        <button onClick={handleExecuteTask} disabled={isProcessing}>
          {isProcessing ? "Generando..." : "Ejecutar Tarea"}
        </button>

        {/* Barra de carga */}
        {isProcessing && (
          <div className="loading-bar-container">
            <div className="loading-bar"></div>
            <p>Generando presentación... Por favor, espera.</p>
          </div>
        )}
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
};
