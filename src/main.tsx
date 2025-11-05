
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";
import "./index.css";

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error('Root element not found!');
  }
  createRoot(root).render(<App />);
} catch (error) {
  console.error('[Main] Failed to start React app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: red;">React App Failed to Load</h1>
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${error}</pre>
      <p>Check the console for more details (F12)</p>
    </div>
  `;
}  