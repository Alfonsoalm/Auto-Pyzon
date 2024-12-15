import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EmailView.css";

export const EmailView = () => {
  const navigate = useNavigate();

  return (
    <div className="view-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅️ Volver
      </button>
      <h2>Gestión de Emails</h2>
      {/* Contenido específico para Email */}
    </div>
  );
};
