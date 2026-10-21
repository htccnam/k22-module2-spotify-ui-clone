// src/routes/index.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import DetailPlaceholder from "../pages/DetailPlaceholder";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        {/* Các route giữ chỗ cho trang chi tiết */}
        <Route path="/playlist/:id" element={<DetailPlaceholder />} />
        <Route path="/artist/:id" element={<DetailPlaceholder />} />
        <Route path="/album/:id" element={<DetailPlaceholder />} />
        <Route path="/track/:id" element={<DetailPlaceholder />} />
      </Route>
    </Routes>
  );
}
