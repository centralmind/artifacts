import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home";
import ReactPage from "./pages/react";
import VuePage from "./pages/vue";
import HtmlPage from "./pages/html";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/react" element={<ReactPage />} />
        <Route path="/vue" element={<VuePage />} />
        <Route path="/html" element={<HtmlPage />} />
      </Routes>
    </Router>
  </StrictMode>
);
