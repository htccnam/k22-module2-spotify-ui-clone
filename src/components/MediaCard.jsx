// src/components/MediaCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause } from "lucide-react";
import { normalizeUrl } from "../config";
import { getInitials } from "../utils/format";
import { usePlayer } from "../context/PlayerContext";

/**
 * MediaCard: Thẻ hiển thị một đối tượng âm nhạc (Nghệ sĩ, Album, Playlist, Bài hát).
 * 
 * Các điểm kiến trúc cần chú ý:
 * 1. normalizeUrl: Ép http:// -> https:// để tránh lỗi chặn mixed-content trên browser.
 * 2. e.stopPropagation(): Khi người dùng bấm nút Play màu xanh, ta chặn sự kiện nổi bọt (bubbling)
 *    để không kích hoạt điều hướng của cả thẻ.
 * 3. Fallback: Nếu không có ảnh hoặc link ảnh bị hỏng (onError), hiển thị ô vuông/tròn với chữ cái đầu.
 */
export default function MediaCard({
  id,
  type, // "artist" | "album" | "playlist" | "track"
  title,
  subtitle,
  image,
  isRound = false,
  onPlay,
}) {
  const navigate = useNavigate();
  const player = usePlayer();
  const [imgError, setImgError] = useState(false);

  const isPlayingThis =
    player.isPlaying && player.currentTrack?.id === id;

  const handleClick = () => {
    navigate(`/${type}/${id}`);
  };

  const handlePlayClick = (e) => {
    e.stopPropagation(); // Không cho nổi bọt lên handleClick của card
    if (onPlay) {
      onPlay({ id, type, title, subtitle, image });
      return;
    }
    if (type === "track") {
      if (isPlayingThis) {
        player.togglePlay();
      } else {
        player.playTrack({
          id,
          title,
          artist_name: subtitle,
          image_url: image,
        });
      }
    } else {
      navigate(`/${type}/${id}`);
    }
  };

  const normalizedImage = image ? normalizeUrl(image) : null;

  return (
    <div
      className={`media-card ${isRound ? "is-artist" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="media-card-cover">
        {normalizedImage && !imgError ? (
          <img
            src={normalizedImage}
            alt={title}
            className={`media-card-img ${isRound ? "is-round" : ""}`}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`media-card-fallback ${isRound ? "is-round" : ""}`}
          >
            {getInitials(title)}
          </div>
        )}

        {/* Nút Play xanh đặc trưng của Spotify - bay lên khi hover */}
        <button
          className="media-card-play-btn"
          aria-label={isPlayingThis ? `Tạm dừng ${title}` : `Phát ${title}`}
          onClick={handlePlayClick}
        >
          {isPlayingThis ? (
            <Pause size={22} fill="currentColor" color="currentColor" />
          ) : (
            <Play size={22} fill="currentColor" color="currentColor" />
          )}
        </button>
      </div>

      <div className="media-card-info">
        <h3 className="media-card-title" title={title}>
          {title}
        </h3>
        <p className="media-card-sub" title={subtitle}>
          {subtitle || (type === "artist" ? "Nghệ sĩ" : "")}
        </p>
      </div>
    </div>
  );
}

