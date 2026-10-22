// src/components/TrackTable.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Play, Pause, Heart, Clock, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { normalizeUrl } from "../config";
import { formatDuration } from "../utils/format";
import { detailsApi } from "../api/details";
import AddToPlaylistModal from "./AddToPlaylistModal";

export default function TrackTable({
  tracks = [],
  showAlbum = true,
  showCover = true,
  onPlayTrack,
  currentPlayingId = null,
  isPlaying = false,
  onRemoveTrack,
}) {
  const navigate = useNavigate();
  const [selectedTrackForAdd, setSelectedTrackForAdd] = useState(null);
  const [activeMenuTrackId, setActiveMenuTrackId] = useState(null);
  const [likedTrackIds, setLikedTrackIds] = useState(new Set());

  // Khởi tạo danh sách bài hát đã like từ prop tracks
  useEffect(() => {
    const initialLiked = new Set();
    tracks.forEach((t) => {
      if (t.is_liked) initialLiked.add(t.id);
    });
    setLikedTrackIds(initialLiked);
  }, [tracks]);

  // Đóng context menu khi click ra ngoài
  useEffect(() => {
    if (!activeMenuTrackId) return;
    const handleClickOutside = () => setActiveMenuTrackId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeMenuTrackId]);

  const handleToggleLike = async (e, trackId) => {
    e.stopPropagation();
    const isLiked = likedTrackIds.has(trackId);
    try {
      await detailsApi.likeTrack(trackId, isLiked ? "unlike" : "like");
      setLikedTrackIds((prev) => {
        const next = new Set(prev);
        if (isLiked) next.delete(trackId);
        else next.add(trackId);
        return next;
      });
      toast.success(
        isLiked ? "Đã xóa khỏi bài hát yêu thích" : "Đã thêm vào bài hát yêu thích"
      );
    } catch (err) {
      toast.error(err.message || "Thao tác thất bại");
    }
  };

  if (!tracks || tracks.length === 0) {
    return (
      <div className="track-table-empty">
        <p>Danh sách bài hát trống.</p>
      </div>
    );
  }

  return (
    <div className="track-table-wrap">
      <table className="track-table">
        <thead>
          <tr className="track-table-header">
            <th className="col-index">#</th>
            <th className="col-title">Tiêu đề</th>
            {showAlbum && <th className="col-album">Album</th>}
            <th className="col-like"></th>
            <th className="col-duration">
              <Clock size={16} />
            </th>
            <th className="col-more"></th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, idx) => {
            const isCurrent = currentPlayingId === track.id;
            const isLiked = likedTrackIds.has(track.id);
            const coverImg = track.image_url || track.album_cover_image_url;

            return (
              <tr
                key={track.id}
                className={`track-row ${isCurrent ? "is-current-playing" : ""}`}
                onDoubleClick={() => onPlayTrack && onPlayTrack(track, idx)}
              >
                {/* 1. Cột STT / Nút Play */}
                <td className="col-index">
                  <span className="track-number">{idx + 1}</span>
                  <button
                    className="track-row-play-btn"
                    onClick={() => onPlayTrack && onPlayTrack(track, idx)}
                    aria-label={`Phát ${track.title}`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause size={14} fill="currentColor" />
                    ) : (
                      <Play size={14} fill="currentColor" />
                    )}
                  </button>
                </td>

                {/* 2. Cột Tiêu đề & Ca sĩ */}
                <td className="col-title">
                  <div className="track-title-cell">
                    {showCover && (
                      <div className="track-thumb-wrap">
                        {coverImg ? (
                          <img
                            src={normalizeUrl(coverImg)}
                            alt=""
                            className="track-thumb"
                          />
                        ) : (
                          <div className="track-thumb-fallback" />
                        )}
                      </div>
                    )}
                    <div className="track-title-info">
                      <Link
                        to={`/track/${track.id}`}
                        className={`track-name ${isCurrent ? "is-active-name" : ""}`}
                      >
                        {track.title}
                      </Link>
                      {track.artist_name && (
                        <span className="track-artist">
                          {track.artist_id ? (
                            <Link to={`/artist/${track.artist_id}`}>
                              {track.artist_name}
                            </Link>
                          ) : (
                            track.artist_name
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 3. Cột Album (tùy chọn) */}
                {showAlbum && (
                  <td className="col-album">
                    {track.album_title ? (
                      <Link
                        to={track.album_id ? `/album/${track.album_id}` : "#"}
                        className="track-album-link"
                      >
                        {track.album_title}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                )}

                {/* 4. Nút Like (Trái tim) */}
                <td className="col-like">
                  <button
                    className={`btn-like ${isLiked ? "is-liked" : ""}`}
                    onClick={(e) => handleToggleLike(e, track.id)}
                    aria-label={isLiked ? "Bỏ thích" : "Thích"}
                    title={isLiked ? "Bỏ thích" : "Lưu vào bài hát yêu thích"}
                  >
                    <Heart
                      size={16}
                      fill={isLiked ? "var(--accent)" : "none"}
                      color={isLiked ? "var(--accent)" : "currentColor"}
                    />
                  </button>
                </td>

                {/* 5. Cột Thời lượng */}
                <td className="col-duration">
                  {formatDuration(track.duration)}
                </td>

                {/* 6. Nút More `...` */}
                <td className="col-more">
                  <div className="track-more-menu-wrap">
                    <button
                      className="btn-track-more"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuTrackId(
                          activeMenuTrackId === track.id ? null : track.id
                        );
                      }}
                      aria-label="Tùy chọn khác"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {activeMenuTrackId === track.id && (
                      <div
                        className="dropdown track-dropdown"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setActiveMenuTrackId(null);
                            setSelectedTrackForAdd(track);
                          }}
                        >
                          <Plus size={16} /> Thêm vào danh sách phát
                        </button>

                        {onRemoveTrack && (
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => {
                              setActiveMenuTrackId(null);
                              onRemoveTrack(track.id);
                            }}
                          >
                            <Trash2 size={16} /> Xóa khỏi playlist này
                          </button>
                        )}

                        {track.artist_id && (
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              setActiveMenuTrackId(null);
                              navigate(`/artist/${track.artist_id}`);
                            }}
                          >
                            Xem nghệ sĩ
                          </button>
                        )}

                        {track.album_id && (
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              setActiveMenuTrackId(null);
                              navigate(`/album/${track.album_id}`);
                            }}
                          >
                            Xem album
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal Thêm vào danh sách phát */}
      {selectedTrackForAdd && (
        <AddToPlaylistModal
          track={selectedTrackForAdd}
          onClose={() => setSelectedTrackForAdd(null)}
        />
      )}
    </div>
  );
}

