import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";
import { LandingPage } from "./LandingPage";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Landing Page is the default home path */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Detection App is at the /detect path */}
        <Route path="/detect" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);