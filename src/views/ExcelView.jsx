import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ExcelView.css";

export const ExcelView = () => {
  const navigate = useNavigate();

  return (
    <div className="view-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅️ Volver
      </button>
      <h2>Gestión de Documentos Excel</h2>
      {/* Contenido específico para Excel */}
    </div>
  );
};
