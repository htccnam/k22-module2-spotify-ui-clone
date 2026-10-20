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

  const value = useMemo(
    () => ({
      authModal,
      openLogin,
      openSignup,
      closeAuthModal,
      switchAuthMode,
    }),
    [authModal, openLogin, openSignup, closeAuthModal, switchAuthMode],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI phải dùng bên trong UIProvider");
  return ctx;
}
