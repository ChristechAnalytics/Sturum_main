import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { applyTheme, getStoredTheme } from "./theme/themeStorage";

applyTheme(getStoredTheme());

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
