// src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-column">
        <Header />
        <main className="main-view">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
