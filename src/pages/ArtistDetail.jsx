// src/pages/ArtistDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Play, Pause, Loader2, Check } from "lucide-react";
import { detailsApi } from "../api/details";
import { formatNumber } from "../utils/format";
import DetailHeader from "../components/DetailHeader";
import TrackTable from "../components/TrackTable";
import MediaCard from "../components/MediaCard";
import { usePlayer } from "../context/PlayerContext";

export default function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [artist, setArtist] = useState(null);
  const [popularTracks, setPopularTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const player = usePlayer();

  const isPlayingThis =
    player.isPlaying &&
    popularTracks.some((t) => t.id === player.currentTrack?.id);

  const handlePlayAll = () => {
    if (popularTracks.length === 0) return;
    if (isPlayingThis) {
      player.togglePlay();
    } else {
      player.playTrack(popularTracks[0], popularTracks);
    }
  };

  useEffect(() => {
    let active = true;

    async function fetchArtistData() {
      setLoading(true);
      try {
        const [aRes, tRes, alRes] = await Promise.allSettled([
          detailsApi.getArtist(id),
          detailsApi.getArtistPopularTracks(id),
          detailsApi.getArtistAlbums(id),
        ]);

        if (!active) return;

        if (aRes.status === "fulfilled") {
          const art = aRes.value.artist || aRes.value;
          setArtist(art);
          setIsFollowing(Boolean(art.is_following));
        } else {
          toast.error("Không tìm thấy nghệ sĩ");
          return;
        }

        if (tRes.status === "fulfilled") {
          setPopularTracks(tRes.value.tracks || []);
        }

        if (alRes.status === "fulfilled") {
          setAlbums(alRes.value.albums || []);
        }
      } catch {
        toast.error("Lỗi khi tải thông tin nghệ sĩ");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchArtistData();

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

  if (!artist) {
    return (
      <div className="detail-not-found">
        <h2>Không tìm thấy nghệ sĩ</h2>
        <button className="btn btn-white" onClick={() => navigate("/")}>
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  const handleToggleFollow = async () => {
    setActionLoading(true);
    try {
      await detailsApi.followArtist(
        artist.id,
        isFollowing ? "unfollow" : "follow"
      );
      setIsFollowing(!isFollowing);
      toast.success(
        isFollowing ? "Đã bỏ theo dõi nghệ sĩ" : "Đã theo dõi nghệ sĩ"
      );
    } catch (err) {
      toast.error(err.message || "Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const meta = [
    artist.monthly_listeners
      ? `${formatNumber(artist.monthly_listeners)} người nghe hàng tháng`
      : null,
    artist.total_followers || artist.follower_count
      ? `${formatNumber(artist.total_followers || artist.follower_count)} người theo dõi`
      : null,
  ].filter(Boolean);

  return (
    <div className="detail-page artist-detail-page">
      {/* 1. Header Hero */}
      <DetailHeader
        type={artist.is_verified ? "NGHỆ SĨ ĐƯỢC XÁC MINH" : "NGHỆ SĨ"}
        title={artist.name}
        description={artist.bio}
        image={artist.image_url}
        isRound={true}
        meta={meta}
      />

      {/* 2. Thanh hành động */}
      <div className="detail-action-bar">
        <button
          className="btn-play-large"
          aria-label={isPlayingThis ? "Tạm dừng" : `Phát nhạc của ${artist.name}`}
          title={isPlayingThis ? "Tạm dừng" : `Phát nhạc của ${artist.name}`}
          onClick={handlePlayAll}
        >
          {isPlayingThis ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" />
          )}
        </button>

        <button
          className={`btn btn-outline ${isFollowing ? "is-following" : ""}`}
          onClick={handleToggleFollow}
          disabled={actionLoading}
        >
          {isFollowing ? (
            <>
              <Check size={16} /> Đang theo dõi
            </>
          ) : (
            "Theo dõi"
          )}
        </button>
      </div>

      {/* 3. Section Bài hát nổi bật */}
      {popularTracks.length > 0 && (
        <section className="detail-section">
          <h2 className="section-title">Phổ biến</h2>
          <TrackTable tracks={popularTracks} showAlbum={true} />
        </section>
      )}

      {/* 4. Section Danh sách Album */}
      {albums.length > 0 && (
        <section className="detail-section">
          <h2 className="section-title">Danh sách đĩa nhạc</h2>
          <div className="media-grid">
            {albums.map((album) => (
              <MediaCard
                key={album.id}
                id={album.id}
                type="album"
                title={album.title}
                subtitle={`${album.release_date ? album.release_date.slice(0, 4) : "Album"} • ${album.total_tracks || 0} bài`}
                image={album.cover_image_url}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
