import React from "react";
import "../styles/TaskCard.css";

export const TaskCard = ({ title, icon, onClick }) => {
  return (
    <div className="task-card" onClick={onClick}>
      <img src={icon} alt={title} className="task-icon" />
      <div className="task-title">{title}</div>
    </div>
  );
}
