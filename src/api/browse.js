// src/api/browse.js
import { api } from "./client";

/**
 * Service API phục vụ cho Trang chủ (Browse/Home)
 * Senior note: Tách riêng API layer giúp component không bị phụ thuộc vào URL backend,
 * sau này backend đổi endpoint ta chỉ cần sửa tại file này.
 */
export const browseApi = {
  // 1. Nghệ sĩ thịnh hành
  getTrendingArtists: (limit = 6) =>
    api.get("/api/artists/trending", { params: { limit } }),

  // 2. Album phổ biến
  getPopularAlbums: (limit = 6) =>
    api.get("/api/albums/popular", { params: { limit } }),

  // 3. Playlist nổi bật
  getPlaylists: (limit = 6) =>
    api.get("/api/playlists", { params: { limit } }),

  // 4. Bài hát thịnh hành
  getTrendingTracks: (limit = 6) =>
    api.get("/api/tracks/trending", { params: { limit } }),
};

