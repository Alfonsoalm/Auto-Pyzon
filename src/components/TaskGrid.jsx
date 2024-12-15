import {TaskCard} from "./TaskCard";
import wordIcon from "../assets/icons/word.png";
import excelIcon from "../assets/icons/excel.png";
import pdfIcon from "../assets/icons/pdf.png";
import emailIcon from "../assets/icons/email.png";
import folderIcon from "../assets/icons/folder.png";
import powerpointIcon from "../assets/icons/powerpoint.png";
import { useNavigate } from "react-router-dom";
import "../styles/TaskGrid.css";

export const TaskGrid = () => {
  const navigate = useNavigate();

  const tasks = [
    { title: "Word", icon: wordIcon, route: "/word" },
    { title: "Excel", icon: excelIcon, route: "/excel" },
    { title: "PDF", icon: pdfIcon, route: "/pdf" },
    { title: "Email", icon: emailIcon, route: "/email" },
    { title: "Folder", icon: folderIcon, route: "/folder" },
    { title: "PowerPoint", icon: powerpointIcon, route: "/powerpoint" },
  ];

  const handleTaskClick = (route) => {
    navigate(route);
  };

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task.title}
          title={`${task.title}`}
          icon={task.icon}
          onClick={() => handleTaskClick(task.route)}
        />
      ))}
    </div>
  );
}
