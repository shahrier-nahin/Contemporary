import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import FactCheckerApp from "./apps/factchecker/FactCheckerApp";
import GeneratorApp from "./apps/generator/GeneratorApp";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );

  function handleLogin() {
    setLoggedIn(true);
  }

  function handleLogout() {
    localStorage.clear();
    setLoggedIn(false);
  }

  return (
    <BrowserRouter>
      {!loggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Routes>
          <Route path="/" element={<Landing onLogout={handleLogout} />} />
          <Route path="/fact-checker" element={<FactCheckerApp onLogout={handleLogout} />} />
          <Route path="/generator" element={<GeneratorApp onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}