// src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar"> {/* Phase 3 sẽ xây Library ở đây */} </aside>
      <div className="main-column">
        <Header />
        <main className="main-view">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
