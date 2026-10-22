// src/components/AddToPlaylistModal.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Plus, Music, Loader2 } from "lucide-react";
import { libraryApi } from "../api/library";
import { detailsApi } from "../api/details";
import { normalizeUrl } from "../config";

/**
 * Modal cho phép người dùng chọn một Playlist của mình để thêm bài hát vào
 */
export default function AddToPlaylistModal({ track, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await libraryApi.myPlaylists();
        if (active) {
          setPlaylists(res.playlists || []);
        }
      } catch {
        toast.error("Không thể tải danh sách playlist");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleAdd = async (playlistId, playlistName) => {
    setAddingId(playlistId);
    try {
      await detailsApi.addTrackToPlaylist(playlistId, track.id);
      toast.success(`Đã thêm vào "${playlistName}"`);
      onClose();
    } catch (err) {
      toast.error(err.message || "Không thể thêm bài hát vào playlist");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal add-playlist-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        <h2 className="modal-title">Thêm vào danh sách phát</h2>
        <p className="modal-subtitle">
          Bài hát: <strong>{track.title}</strong> - {track.artist_name || track.subtitle}
        </p>

        <div className="add-playlist-list">
          {loading ? (
            <div className="add-playlist-loading">
              <Loader2 size={24} className="spin" />
            </div>
          ) : playlists.length === 0 ? (
            <p className="add-playlist-empty">
              Bạn chưa có danh sách phát nào. Hãy tạo playlist mới trước nhé!
            </p>
          ) : (
            playlists.map((pl) => (
              <button
                key={pl.id}
                className="add-playlist-item"
                disabled={addingId === pl.id}
                onClick={() => handleAdd(pl.id, pl.name)}
              >
                {pl.image_url ? (
                  <img
                    src={normalizeUrl(pl.image_url)}
                    alt={pl.name}
                    className="add-playlist-img"
                  />
                ) : (
                  <div className="add-playlist-fallback">
                    <Music size={18} />
                  </div>
                )}
                <div className="add-playlist-info">
                  <span className="add-playlist-name">{pl.name}</span>
                  <span className="add-playlist-count">{pl.total_tracks || 0} bài hát</span>
                </div>
                <div className="add-playlist-action">
                  {addingId === pl.id ? (
                    <Loader2 size={18} className="spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
