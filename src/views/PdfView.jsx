import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PdfView.css";

export const PdfView = () => {
  const navigate = useNavigate();

  return (
    <div className="view-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅️ Volver
      </button>
      <h2>Gestión de Documentos PDF</h2>
      {/* Contenido específico para PDF */}
    </div>
  );
};
