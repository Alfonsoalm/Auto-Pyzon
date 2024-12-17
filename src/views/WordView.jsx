import React, { useState } from "react";
import "../styles/WordView.css";

export const WordView = () => {
  const [task, setTask] = useState("combine_tables");
  const [folderPath, setFolderPath] = useState("");
  const [outputFile, setOutputFile] = useState("Documento_Combinado");
  const [outputFormat, setOutputFormat] = useState("word");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // Estado para la barra de carga

  const handleSelectFolder = async () => {
    const folder = await window.api.selectFolder();
    if (folder) setFolderPath(folder);
  };

  const handleExecuteTask = async () => {
    if (!folderPath) {
      setMessage("Por favor, selecciona una carpeta con documentos Word.");
      return;
    }

    const params = {
      task,
      folder: folderPath,
      output_file: outputFile,
      output_format: outputFormat,
    };

    setIsProcessing(true); // Iniciar barra de carga
    setMessage("");

    try {
      const result = await window.api.executePython("word_manager.py", params);
      setMessage(result);
    } catch (error) {
      setMessage("Error: " + error);
    } finally {
      setIsProcessing(false); // Detener barra de carga
    }
  };

  return (
    <div className="view-container">
      <h2>Gestión de Documentos Word</h2>

      <div className="word-form">
        <label htmlFor="task-select">Selecciona una tarea:</label>
        <select
          id="task-select"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          disabled={isProcessing}
        >
          <option value="combine_tables">Combinar Tablas de Documentos</option>
          {/* Aquí se pueden añadir más opciones en el futuro */}
        </select>

        <button onClick={handleSelectFolder} disabled={isProcessing}>
          Seleccionar Carpeta
        </button>
        {folderPath && <p>Carpeta seleccionada: {folderPath}</p>}

        <input
          type="text"
          placeholder="Nombre del archivo de salida"
          value={outputFile}
          onChange={(e) => setOutputFile(e.target.value)}
          disabled={isProcessing}
        />

        <label htmlFor="output-format">Formato de salida:</label>
        <select
          id="output-format"
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value)}
          disabled={isProcessing}
        >
          <option value="word">Word</option>
          <option value="pdf">PDF</option>
        </select>

        <button onClick={handleExecuteTask} disabled={isProcessing}>
          {isProcessing ? "Procesando..." : "Ejecutar Tarea"}
        </button>
      </div>

      {/* Barra de carga */}
      {isProcessing && (
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
          <p>Procesando... Por favor, espera.</p>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};
