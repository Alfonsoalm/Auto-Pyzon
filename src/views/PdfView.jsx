import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PdfView.css";

export const PdfView = () => {
  const navigate = useNavigate();
  const [task, setTask] = useState("merge_folder");
  const [folderPath, setFolderPath] = useState("");
  const [inputPdf, setInputPdf] = useState("");
  const [pageList, setPageList] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSelectFolder = async () => {
    const folder = await window.api.selectFolder();
    if (folder) setFolderPath(folder);
  };

  const handleSelectFile = async (setter) => {
    const file = await window.api.selectFile(["pdf"]);
    if (file) setter(file);
  };

  const handleExecuteTask = async () => {
    const params = {
      task,
    };

    if (task === "merge_folder") {
      if (!folderPath) {
        setMessage("Por favor, selecciona una carpeta.");
        setMessageType("error");
        return;
      }
      params.folder = folderPath;
    } else if (task === "merge_pages") {
      if (!inputPdf || !pageList) {
        setMessage("Por favor, selecciona un archivo PDF y proporciona las páginas.");
        setMessageType("error");
        return;
      }
      params.input_pdf = inputPdf;
      params.page_list = pageList;
    }

    try {
      const result = await window.api.executePython("pdf_manager.py", params);
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
      <h2>Gestión de Documentos PDF</h2>

      <div>
        <label htmlFor="task-select">Selecciona una tarea:</label>
        <select id="task-select" value={task} onChange={(e) => setTask(e.target.value)}>
          <option value="merge_folder">Unir todos los PDF's</option>
          <option value="merge_pages">Combinar paginas de un PDF</option>
        </select>
      </div>

      {task === "merge_folder" && (
        <div>
          <button onClick={handleSelectFolder}>Seleccionar Carpeta</button>
          {folderPath && <p>Carpeta seleccionada: {folderPath}</p>}
        </div>
      )}

      {task === "merge_pages" && (
        <div>
          <button onClick={() => handleSelectFile(setInputPdf)}>Seleccionar PDF de Entrada</button>
          {inputPdf && <p>Archivo seleccionado: {inputPdf}</p>}
          <input
            type="text"
            placeholder="Páginas (ejemplo: 1,2,3)"
            value={pageList}
            onChange={(e) => setPageList(e.target.value)}
          />
        </div>
      )}

      <button onClick={handleExecuteTask}>Ejecutar Tarea</button>

      {message && <p className={`message ${messageType}`}>{message}</p>}
    </div>
  );
};
