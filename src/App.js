import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header, TaskGrid, WordView, ExcelView, PdfView } from "./imports.js";
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
          <Route path="/word" element={<WordView />} />
          <Route path="/excel" element={<ExcelView />} />
          <Route path="/pdf" element={<PdfView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
