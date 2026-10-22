// src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Player from "./Player";

export default function Layout() {
  return (
    <div className="app-shell">
      <div className="app-main-layout">
        <Sidebar />
        <div className="main-column">
          <Header />
          <main className="main-view">
            <Outlet />
          </main>
        </div>
      </div>
      <Player />
    </div>
  );
}
