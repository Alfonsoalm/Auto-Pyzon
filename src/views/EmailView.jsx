import React, { useState } from "react";
import "../styles/EmailView.css";

export const EmailView = () => {
  const [task, setTask] = useState("send_email");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    to_email: "",
    to_emails: "",
    subject: "",
    message: "",
    number_emails: 10,
    save_path: "",
    format: "txt",
  });
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // Estado para la barra de carga

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSelectFolder = async () => {
    const folder = await window.api.selectFolder();
    if (folder) {
      setFormData({ ...formData, save_path: folder });
    }
  };

  const handleExecute = async () => {
    const params = { task, ...formData };

    setIsProcessing(true); // Inicia la barra de carga
    setMessage("");

    try {
      const result = await window.api.executePython("email_manager.py", params);
      setMessage(result);
    } catch (error) {
      setMessage("Error: " + error);
    } finally {
      setIsProcessing(false); // Detiene la barra de carga
    }
  };

  return (
    <div className="view-container email-form-container">
      <h2 className="email-form-title">Gestión de Emails</h2>

      <div className="email-form-group">
        <label className="email-form-label" htmlFor="task-select">Tarea:</label>
        <select
          id="task-select"
          className="email-form-select"
          onChange={(e) => setTask(e.target.value)}
          value={task}
          disabled={isProcessing}
        >
          <option value="send_email">Enviar Correo Individual</option>
          <option value="send_bulk_emails">Enviar Correos Masivos</option>
          <option value="read_emails">Leer Correos</option>
        </select>
      </div>

      <div className="email-form-group">
        <input
          className="email-form-input"
          name="username"
          placeholder="Tu correo (usuario)"
          onChange={handleChange}
          disabled={isProcessing}
        />
      </div>
      <div className="email-form-group">
        <input
          className="email-form-input"
          type="password"
          name="password"
          placeholder="Contraseña de Aplicación"
          onChange={handleChange}
          disabled={isProcessing}
        />
      </div>

      <hr/>

      {task === "send_email" && (
        <>
          <div className="email-form-group">
            <input
              className="email-form-input"
              name="to_email"
              placeholder="Correo Destinatario"
              onChange={handleChange}
              disabled={isProcessing}
            />
          </div>
          <div className="email-form-group">
            <input
              className="email-form-input"
              name="subject"
              placeholder="Asunto"
              onChange={handleChange}
              disabled={isProcessing}
            />
          </div>
          <div className="email-form-group">
            <textarea
              className="email-form-textarea"
              name="message"
              placeholder="Mensaje"
              onChange={handleChange}
              disabled={isProcessing}
            />
          </div>
        </>
      )}

      {task === "send_bulk_emails" && (
        <>
          <div className="email-form-group">
            <textarea
              className="email-form-textarea"
              name="to_emails"
              placeholder="Correos separados por comas"
              onChange={handleChange}
              disabled={isProcessing}
            />
          </div>
          <div className="email-form-group">
            <input
              className="email-form-input"
              name="subject"
              placeholder="Asunto"
              onChange={handleChange}
              disabled={isProcessing}
            />
          </div>
          <div className="email-form-group">
            <textarea
              className="email-form-textarea"
              name="message"
              placeholder="Mensaje"
              onChange={handleChange}
              disabled={isProcessing}
            />
          </div>
        </>
      )}

      {task === "read_emails" && (
        <>
          <div className="email-form-group">
            <input
              className="email-form-input"
              name="number_emails"
              type="number"
              placeholder="Número de Correos a Leer"
              onChange={handleChange}
              disabled={isProcessing}
            />
          </div>
          <div className="email-form-group">
            <button className="email-form-button" onClick={handleSelectFolder} disabled={isProcessing}>
              Seleccionar Carpeta de Guardado
            </button>
            {formData.save_path && (
              <p className="email-form-note">Carpeta seleccionada: {formData.save_path}</p>
            )}
          </div>
          <div className="email-form-group">
            <label className="email-form-label" htmlFor="format-select">Formato:</label>
            <select
              id="format-select"
              className="email-form-select"
              name="format"
              onChange={handleChange}
              value={formData.format}
              disabled={isProcessing}
            >
              <option value="txt">TXT</option>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
            </select>
          </div>
        </>
      )}

      <button className="email-form-button execute-button" onClick={handleExecute} disabled={isProcessing}>
        {isProcessing ? "Procesando..." : "Ejecutar"}
      </button>

      {/* Barra de carga */}
      {isProcessing && (
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
          <p>Procesando... Por favor, espera.</p>
        </div>
      )}

      {message && <p className="email-form-message">{message}</p>}
    </div>
  );
};
