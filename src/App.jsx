// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";
import Layout from "./components/Layout";
import AuthModal from "./components/AuthModal";
import Home from "./pages/Home";
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
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
            </Route>
          </Routes>
          <AuthModal />
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
