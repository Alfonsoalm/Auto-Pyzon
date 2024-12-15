import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WordView.css";

export const WordView = () => {
  const navigate = useNavigate();

  return (
    <div className="view-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅️ Volver
      </button>
      <h2>Gestión de Documentos Word</h2>
      {/* Contenido específico para Word */}
    </div>
  );
};
