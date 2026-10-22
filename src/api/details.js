// src/api/details.js
import { api } from "./client";

export const detailsApi = {
  // ===== 1. Playlist =====
  getPlaylist: (id) => api.get(`/api/playlists/${id}`),
  getPlaylistTracks: (id) => api.get(`/api/playlists/${id}/tracks`),
  updatePlaylist: (id, payload) => api.put(`/api/playlists/${id}`, payload),
  uploadPlaylistCover: (id, file) => {
    const formData = new FormData();
    formData.append("cover", file);
    return api.post(`/api/upload/playlist/${id}/cover`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deletePlaylist: (id) => api.delete(`/api/playlists/${id}`),
  followPlaylist: (id, action) =>
    api.request({
      method: action === "unfollow" ? "DELETE" : "POST",
      url: `/api/playlists/${id}/follow`,
    }),
  addTrackToPlaylist: (playlistId, trackId) =>
    api.post(`/api/playlists/${playlistId}/tracks`, { track_id: trackId }),
  removeTrackFromPlaylist: (playlistId, trackId) =>
    api.delete(`/api/playlists/${playlistId}/tracks/${trackId}`),

  // ===== 2. Artist =====
  getArtist: (id) => api.get(`/api/artists/${id}`),
  getArtistAlbums: (id) => api.get(`/api/artists/${id}/albums`),
  getArtistPopularTracks: (id) =>
    api.get(`/api/artists/${id}/tracks/popular`),
  followArtist: (id, action) =>
    api.request({
      method: action === "unfollow" ? "DELETE" : "POST",
      url: `/api/artists/${id}/follow`,
    }),

  // ===== 3. Album =====
  getAlbum: (id) => api.get(`/api/albums/${id}`),
  getAlbumTracks: (id) => api.get(`/api/albums/${id}/tracks`),
  likeAlbum: (id, action) =>
    api.request({
      method: action === "unlike" ? "DELETE" : "POST",
      url: `/api/albums/${id}/like`,
    }),

  // ===== 4. Track =====
  getTrack: (id) => api.get(`/api/tracks/${id}`),
  likeTrack: (id, action) =>
    api.request({
      method: action === "unlike" ? "DELETE" : "POST",
      url: `/api/tracks/${id}/like`,
    }),
};

