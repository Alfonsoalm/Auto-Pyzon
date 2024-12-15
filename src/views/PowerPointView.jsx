import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PowerPointView.css";

export const PowerPointView = () => {
  const navigate = useNavigate();

  return (
    <div className="view-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅️ Volver
      </button>
      <h2>Gestión de Documentos PowerPoint</h2>
      {/* Contenido específico para PowerPoint */}
    </div>
  );
};
