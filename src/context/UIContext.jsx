// src/context/UIContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  // authModal = { open: boolean, mode: "login" | "signup" }
  const [authModal, setAuthModal] = useState({ open: false, mode: "login" });
  // Quản lý trạng thái mở/đóng Sidebar trên Mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openLogin = useCallback(
    () => setAuthModal({ open: true, mode: "login" }),
    [],
  );
  const openSignup = useCallback(
    () => setAuthModal({ open: true, mode: "signup" }),
    [],
  );
  const closeAuthModal = useCallback(
    () => setAuthModal((s) => ({ ...s, open: false })),
    [],
  );
  const switchAuthMode = useCallback(
    (mode) => setAuthModal((s) => ({ ...s, mode })),
    [],
  );

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const value = useMemo(
    () => ({
      authModal,
      openLogin,
      openSignup,
      closeAuthModal,
      switchAuthMode,
      sidebarOpen,
      toggleSidebar,
      closeSidebar,
    }),
    [
      authModal,
      openLogin,
      openSignup,
      closeAuthModal,
      switchAuthMode,
      sidebarOpen,
      toggleSidebar,
      closeSidebar,
    ],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI phải dùng bên trong UIProvider");
  return ctx;
}
