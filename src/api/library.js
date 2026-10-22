import { api } from "./client";

export const libraryApi = {
  myPlaylists: () =>
    api.get("/api/me/playlists", {
      params: { limit: 50 },
    }),
  followedPlaylists: () =>
    api.get("/api/me/playlists/followed", { params: { limit: 50 } }),
  myAlbums: () => api.get("/api/me/albums/liked", { params: { limit: 50 } }),
  myArtists: () => api.get("/api/me/following", { params: { limit: 50 } }),

  createPlaylist: (payload) => api.post("/api/playlists", payload),
  deletePlaylist: (id) => api.delete(`/api/playlists/${id}`),
  followPlaylist: (
    id,
    action, // action: "follow" | "unfollow"
  ) =>
    api.request({
      method: action === "unfollow" ? "DELETE" : "POST",
      url: `/api/playlists/${id}/follow`,
    }),
  followArtist: (id, action) =>
    api.request({
      method: action === "unfollow" ? "DELETE" : "POST",
      url: `/api/artists/${id}/follow`,
    }),
  likeAlbum: (
    id,
    action, // action: "unlike" | "like"
  ) =>
    api.request({
      method: action === "unlike" ? "DELETE" : "POST",
      url: `/api/albums/${id}/like`,
    }),
};
