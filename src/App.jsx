// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";
import { PlayerProvider } from "./context/PlayerContext";
import AuthModal from "./components/AuthModal";
import AppRoutes from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <PlayerProvider>
            <Toaster
              position="top-center"
              toastOptions={{ style: { background: "#282828", color: "#fff" } }}
            />
            <AppRoutes />
            <AuthModal />
          </PlayerProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
