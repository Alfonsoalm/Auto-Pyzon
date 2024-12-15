import React from "react";
import "../styles/Header.css";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <h1>AutoPyzon</h1>
      <button className="back-button" onClick={() => navigate("/")}>⬅️ Volver</button>
    </header>
  );
};
