import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BlackjackGame from "./components/BlackjackGame.js";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="bg-green-800 min-h-screen">
        <Routes>
          <Route path="*" element={<BlackjackGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
