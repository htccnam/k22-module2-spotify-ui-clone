// src/pages/PlaylistDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Play, Pause, Heart, Trash2, Edit3, Globe, Lock, Loader2 } from "lucide-react";
import { detailsApi } from "../api/details";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { formatTotalDuration } from "../utils/format";
import DetailHeader from "../components/DetailHeader";
import TrackTable from "../components/TrackTable";
import EditPlaylistModal from "../components/EditPlaylistModal";

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const player = usePlayer();

  const isPlayingThis =
    player.isPlaying &&
    tracks.some((t) => t.id === player.currentTrack?.id);

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    if (isPlayingThis) {
      player.togglePlay();
    } else {
      player.playTrack(tracks[0], tracks);
    }
  };

  useEffect(() => {
    let active = true;

    async function fetchPlaylistData() {
      try {
        setLoading(true);
        const [pRes, tRes] = await Promise.allSettled([
          detailsApi.getPlaylist(id),
          detailsApi.getPlaylistTracks(id),
        ]);

        if (!active) return;

        if (pRes.status === "fulfilled") {
          const pl = pRes.value.playlist || pRes.value;
          setPlaylist(pl);
          setIsFollowing(Boolean(pl.is_following));
        } else {
          toast.error("Không tìm thấy playlist");
          return;
        }

        if (tRes.status === "fulfilled") {
          setTracks(tRes.value.tracks || []);
        }
      } catch {
        toast.error("Lỗi khi tải dữ liệu playlist");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchPlaylistData();

    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  if (loading) {
    return (
      <div className="detail-loading">
        <Loader2 size={36} className="spin text-accent" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="detail-not-found">
        <h2>Không tìm thấy danh sách phát</h2>
        <button className="btn btn-white" onClick={() => navigate("/")}>
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  const isOwner = Boolean(
    playlist.is_owner || (user && playlist.user_id === user.id)
  );

  const handleToggleFollow = async () => {
    setActionLoading(true);
    try {
      await detailsApi.followPlaylist(
        playlist.id,
        isFollowing ? "unfollow" : "follow"
      );
      setIsFollowing(!isFollowing);
      toast.success(
        isFollowing
          ? "Đã xóa khỏi Thư viện của bạn"
          : "Đã lưu vào Thư viện của bạn"
      );
    } catch (err) {
      toast.error(err.message || "Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    const nextPublic = !playlist.is_public;
    try {
      await detailsApi.updatePlaylist(playlist.id, {
        is_public: nextPublic ? 1 : 0,
      });
      setPlaylist((prev) => ({ ...prev, is_public: nextPublic ? 1 : 0 }));
      toast.success(
        nextPublic ? "Đã chuyển sang Công khai" : "Đã chuyển sang Riêng tư"
      );
    } catch (err) {
      toast.error(err.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${playlist.name}"?`)) return;
    try {
      await detailsApi.deletePlaylist(playlist.id);
      toast.success("Đã xóa playlist");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Xóa playlist thất bại");
    }
  };

  const handleRemoveTrack = async (trackId) => {
    try {
      await detailsApi.removeTrackFromPlaylist(playlist.id, trackId);
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      toast.success("Đã xóa bài hát khỏi playlist");
    } catch (err) {
      toast.error(err.message || "Không thể xóa bài hát");
    }
  };

  // Metadata hiển thị dưới tiêu đề
  const meta = [
    playlist.user_display_name || playlist.user_username || "Spotify",
    `${tracks.length} bài hát`,
    playlist.total_duration ? formatTotalDuration(playlist.total_duration) : null,
    `${playlist.followers_count || 0} người theo dõi`,
  ].filter(Boolean);

  return (
    <div className="detail-page playlist-detail-page">
      {/* 1. Header Hero */}
      <DetailHeader
        type={playlist.is_public ? "DANH SÁCH PHÁT CÔNG KHAI" : "DANH SÁCH PHÁT RIÊNG TƯ"}
        title={playlist.name}
        description={playlist.description}
        image={playlist.image_url}
        meta={meta}
        isEditable={isOwner}
        onEdit={() => setShowEditModal(true)}
      />

      {/* 2. Thanh hành động (Action Bar) */}
      <div className="detail-action-bar">
        <button
          className="btn-play-large"
          aria-label={isPlayingThis ? "Tạm dừng" : "Phát playlist"}
          title={isPlayingThis ? "Tạm dừng" : "Phát playlist"}
          onClick={handlePlayAll}
        >
          {isPlayingThis ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" />
          )}
        </button>

        {/* Nút Follow / Save nếu không phải chủ sở hữu */}
        {!isOwner && (
          <button
            className={`btn-action-icon ${isFollowing ? "is-active text-accent" : ""}`}
            onClick={handleToggleFollow}
            disabled={actionLoading}
            title={isFollowing ? "Xóa khỏi Thư viện" : "Lưu vào Thư viện"}
          >
            <Heart
              size={32}
              fill={isFollowing ? "var(--accent)" : "none"}
              color={isFollowing ? "var(--accent)" : "currentColor"}
            />
          </button>
        )}

        {/* Các nút dành cho chủ sở hữu Playlist */}
        {isOwner && (
          <div className="owner-actions">
            <button
              className="btn btn-outline"
              onClick={() => setShowEditModal(true)}
            >
              <Edit3 size={16} /> Chỉnh sửa
            </button>

            <button
              className="btn btn-outline"
              onClick={handleTogglePublic}
              title={playlist.is_public ? "Chuyển sang Riêng tư" : "Chuyển sang Công khai"}
            >
              {playlist.is_public ? (
                <>
                  <Globe size={16} /> Công khai
                </>
              ) : (
                <>
                  <Lock size={16} /> Riêng tư
                </>
              )}
            </button>

            <button
              className="btn btn-outline btn-danger-outline"
              onClick={handleDeletePlaylist}
            >
              <Trash2 size={16} /> Xóa
            </button>
          </div>
        )}
      </div>

      {/* 3. Bảng bài hát */}
      <TrackTable
        tracks={tracks}
        showAlbum={true}
        onRemoveTrack={isOwner ? handleRemoveTrack : null}
      />

      {/* 4. Modal sửa playlist */}
      {showEditModal && (
        <EditPlaylistModal
          playlist={playlist}
          onClose={() => setShowEditModal(false)}
          onSaved={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

