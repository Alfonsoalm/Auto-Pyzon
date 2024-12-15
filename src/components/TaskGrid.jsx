import {TaskCard} from "./TaskCard";
import wordIcon from "../assets/icons/word.png";
import excelIcon from "../assets/icons/excel.png";
import pdfIcon from "../assets/icons/pdf.png";
import { useNavigate } from "react-router-dom";
import "../styles/TaskGrid.css";

export const TaskGrid = () => {
  const navigate = useNavigate();

  const tasks = [
    { title: "Word", icon: wordIcon, route: "/word" },
    { title: "Excel", icon: excelIcon, route: "/excel" },
    { title: "PDF", icon: pdfIcon, route: "/pdf" },
  ];

  const handleTaskClick = (route) => {
    navigate(route);
  };

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task.title}
          title={`Guardar en ${task.title}`}
          icon={task.icon}
          onClick={() => handleTaskClick(task.route)}
        />
      ))}
    </div>
  );
}
