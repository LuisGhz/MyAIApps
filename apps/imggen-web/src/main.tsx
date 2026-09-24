import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppAuth0Provider } from "@core/AppAuth0Provider";
import { AppRoutes } from "@core/AppRoutes";
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppAuth0Provider>
      <AppRoutes />
    </AppAuth0Provider>
  </StrictMode>
);
