import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header, TaskGrid, WordView, ExcelView, PdfView, EmailView, PowerPointView, FolderView } from "./imports.js";
import "../src/styles/App.css";


function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          {/* Ruta principal con los iconos */}
          <Route path="/" element={<TaskGrid />} />

          {/* Rutas específicas para cada tipo de archivo */}
          <Route path="/email" element={<EmailView />} />
          <Route path="/excel" element={<ExcelView />} />
          <Route path="/folder" element={<FolderView />} />
          <Route path="/pdf" element={<PdfView />} />
          <Route path="/powerpoint" element={<PowerPointView />} />
          <Route path="/word" element={<WordView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
