import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";
import { SoundProvider } from "@/hooks/use-sound";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <SoundProvider>
      <App />
    </SoundProvider>
  </AuthProvider>
);
