
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill for process in browser environments.
// We capture the VITE_API_KEY injected by the build system and assign it 
// to process.env.API_KEY so the geminiService can use it.
const builtInKey = import.meta.env?.VITE_API_KEY || '';

if (typeof window !== 'undefined') {
  if (!(window as any).process) {
    (window as any).process = { env: {} };
  }
  // Assign the key found in the build environment
  (window as any).process.env.API_KEY = builtInKey;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
