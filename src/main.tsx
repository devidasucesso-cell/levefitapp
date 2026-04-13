import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard: unregister service workers in iframe/preview contexts
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
} else if ('serviceWorker' in navigator) {
  // Register push SW early in production so it's ready for push events
  navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
    .then((reg) => {
      console.log('[Main] Push SW registered, scope:', reg.scope);
    })
    .catch((err) => {
      console.warn('[Main] SW registration failed:', err);
    });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
