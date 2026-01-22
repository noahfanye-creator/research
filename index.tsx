
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill for process in browser environments to prevent crashes
// when accessing process.env.API_KEY
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = {
    env: {
      // Allow the app to load; the actual key will be injected by the build system
      // or remain empty if not configured, preventing the white screen crash.
      API_KEY: '' 
    }
  };
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
