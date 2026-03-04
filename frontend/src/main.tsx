import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// The main entry point for the frontend React application.
// Initializes ReactDOM and mounts the main App component
// to the root DOM node with StrictMode enabled for best practices.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
