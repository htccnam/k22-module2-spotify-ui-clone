// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";
import AuthModal from "./components/AuthModal";
import AppRoutes from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <Toaster
            position="top-center"
            toastOptions={{ style: { background: "#282828", color: "#fff" } }}
          />
          <AppRoutes />
          <AuthModal />
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
