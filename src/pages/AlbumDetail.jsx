// src/pages/AlbumDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Play, Heart, Loader2 } from "lucide-react";
import { detailsApi } from "../api/details";
import { formatTotalDuration, formatYear, formatNumber } from "../utils/format";
import DetailHeader from "../components/DetailHeader";
import TrackTable from "../components/TrackTable";

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchAlbumData() {
      setLoading(true);
      try {
        const [aRes, tRes] = await Promise.allSettled([
          detailsApi.getAlbum(id),
          detailsApi.getAlbumTracks(id),
        ]);

        if (!active) return;

        if (aRes.status === "fulfilled") {
          const alb = aRes.value.album || aRes.value;
          setAlbum(alb);
          setIsLiked(Boolean(alb.is_liked));
        } else {
          toast.error("Không tìm thấy album");
          return;
        }

        if (tRes.status === "fulfilled") {
          setTracks(tRes.value.tracks || []);
        }
      } catch {
        toast.error("Lỗi khi tải thông tin album");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAlbumData();

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

  if (!album) {
    return (
      <div className="detail-not-found">
        <h2>Không tìm thấy album</h2>
        <button className="btn btn-white" onClick={() => navigate("/")}>
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  const handleToggleLike = async () => {
    setActionLoading(true);
    try {
      await detailsApi.likeAlbum(album.id, isLiked ? "unlike" : "like");
      setIsLiked(!isLiked);
      toast.success(
        isLiked
          ? "Đã xóa khỏi Thư viện của bạn"
          : "Đã lưu vào Thư viện của bạn"
      );
    } catch (err) {
      toast.error(err.message || "Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const meta = [
    album.artist_id ? (
      <Link
        key="artist"
        to={`/artist/${album.artist_id}`}
        className="detail-artist-link"
      >
        {album.artist_name}
      </Link>
    ) : (
      album.artist_name
    ),
    album.release_date ? formatYear(album.release_date) : null,
    `${tracks.length} bài hát`,
    album.total_duration ? formatTotalDuration(album.total_duration) : null,
    album.play_count ? `${formatNumber(album.play_count)} lượt phát` : null,
  ].filter(Boolean);

  return (
    <div className="detail-page album-detail-page">
      {/* 1. Header Hero */}
      <DetailHeader
        type="ALBUM"
        title={album.title}
        description={album.description}
        image={album.cover_image_url}
        meta={meta}
      />

      {/* 2. Thanh hành động */}
      <div className="detail-action-bar">
        <button
          className="btn-play-large"
          aria-label={`Phát album ${album.title}`}
          title={`Phát album ${album.title}`}
        >
          <Play size={24} fill="currentColor" />
        </button>

        <button
          className={`btn-action-icon ${isLiked ? "is-active text-accent" : ""}`}
          onClick={handleToggleLike}
          disabled={actionLoading}
          title={isLiked ? "Xóa khỏi Thư viện" : "Lưu vào Thư viện"}
        >
          <Heart
            size={32}
            fill={isLiked ? "var(--accent)" : "none"}
            color={isLiked ? "var(--accent)" : "currentColor"}
          />
        </button>
      </div>

      {/* 3. Bảng danh sách bài hát trong Album */}
      <TrackTable tracks={tracks} showAlbum={false} showCover={false} />
    </div>
  );
}
