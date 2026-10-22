// src/routes/index.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import PlaylistDetail from "../pages/PlaylistDetail";
import ArtistDetail from "../pages/ArtistDetail";
import AlbumDetail from "../pages/AlbumDetail";
import TrackDetail from "../pages/TrackDetail";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        {/* Các trang chi tiết hoàn chỉnh (Phase 5) */}
        <Route path="/playlist/:id" element={<PlaylistDetail />} />
        <Route path="/artist/:id" element={<ArtistDetail />} />
        <Route path="/album/:id" element={<AlbumDetail />} />
        <Route path="/track/:id" element={<TrackDetail />} />
      </Route>
    </Routes>
  );
}
