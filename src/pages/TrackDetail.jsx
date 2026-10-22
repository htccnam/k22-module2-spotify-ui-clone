// src/pages/TrackDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Play, Heart, Plus, Loader2 } from "lucide-react";
import { detailsApi } from "../api/details";
import { formatDuration, formatNumber, formatYear } from "../utils/format";
import DetailHeader from "../components/DetailHeader";
import TrackTable from "../components/TrackTable";
import AddToPlaylistModal from "../components/AddToPlaylistModal";

export default function TrackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [track, setTrack] = useState(null);
  const [artistTracks, setArtistTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchTrackData() {
      setLoading(true);
      try {
        const res = await detailsApi.getTrack(id);
        if (!active) return;
        const tr = res.track || res;
        setTrack(tr);
        setIsLiked(Boolean(tr.is_liked));

        // Nếu có artist_id, tải thêm các bài hát phổ biến của nghệ sĩ đó
        if (tr.artist_id) {
          const aRes = await detailsApi.getArtistPopularTracks(tr.artist_id);
          if (active && aRes.tracks) {
            setArtistTracks(aRes.tracks.filter((t) => t.id !== tr.id).slice(0, 5));
          }
        }
      } catch {
        toast.error("Không tìm thấy bài hát");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchTrackData();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="detail-loading">
        <Loader2 size={36} className="spin text-accent" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="detail-not-found">
        <h2>Không tìm thấy bài hát</h2>
        <button className="btn btn-white" onClick={() => navigate("/")}>
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  const handleToggleLike = async () => {
    setActionLoading(true);
    try {
      await detailsApi.likeTrack(track.id, isLiked ? "unlike" : "like");
      setIsLiked(!isLiked);
      toast.success(
        isLiked
          ? "Đã xóa khỏi bài hát yêu thích"
          : "Đã thêm vào bài hát yêu thích"
      );
    } catch (err) {
      toast.error(err.message || "Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const meta = [
    track.artist_id ? (
      <Link
        key="artist"
        to={`/artist/${track.artist_id}`}
        className="detail-artist-link"
      >
        {track.artist_name}
      </Link>
    ) : (
      track.artist_name
    ),
    track.album_title ? (
      <Link
        key="album"
        to={track.album_id ? `/album/${track.album_id}` : "#"}
        className="detail-album-link"
      >
        {track.album_title}
      </Link>
    ) : null,
    track.created_at ? formatYear(track.created_at) : null,
    formatDuration(track.duration),
    track.play_count ? `${formatNumber(track.play_count)} lượt phát` : null,
  ].filter(Boolean);

  return (
    <div className="detail-page track-detail-page">
      {/* 1. Header Hero */}
      <DetailHeader
        type="BÀI HÁT"
        title={track.title}
        image={track.image_url || track.album_cover_image_url}
        meta={meta}
      />

      {/* 2. Thanh hành động */}
      <div className="detail-action-bar">
        <button
          className="btn-play-large"
          aria-label={`Phát bài hát ${track.title}`}
          title={`Phát bài hát ${track.title}`}
        >
          <Play size={24} fill="currentColor" />
        </button>

        <button
          className={`btn-action-icon ${isLiked ? "is-active text-accent" : ""}`}
          onClick={handleToggleLike}
          disabled={actionLoading}
          title={isLiked ? "Bỏ thích" : "Lưu vào bài hát yêu thích"}
        >
          <Heart
            size={32}
            fill={isLiked ? "var(--accent)" : "none"}
            color={isLiked ? "var(--accent)" : "currentColor"}
          />
        </button>

        <button
          className="btn btn-outline"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} /> Thêm vào playlist
        </button>
      </div>

      {/* 3. Bài hát gợi ý khác từ cùng nghệ sĩ */}
      {artistTracks.length > 0 && (
        <section className="detail-section">
          <h2 className="section-title">
            Bài hát phổ biến khác của {track.artist_name}
          </h2>
          <TrackTable tracks={artistTracks} showAlbum={true} />
        </section>
      )}

      {/* 4. Modal Thêm vào playlist */}
      {showAddModal && (
        <AddToPlaylistModal
          track={track}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
