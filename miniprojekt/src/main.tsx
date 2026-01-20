import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("FATAL: Could not find root element 'root' in index.html");
  document.body.innerHTML = '<div style="color:red; font-size: 20px; padding: 20px;">Error: Root element not found. Check index.html</div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (e) {
    console.error("React Mount Error:", e);
    rootElement.innerHTML = `<div style="color:red;">React Mount Crash: ${e}</div>`;
  }
}
