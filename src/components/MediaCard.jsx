// src/components/MediaCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { normalizeUrl } from "../config";
import { getInitials } from "../utils/format";

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
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    navigate(`/${type}/${id}`);
  };

  const handlePlayClick = (e) => {
    e.stopPropagation(); // Không cho nổi bọt lên handleClick của card
    if (onPlay) {
      onPlay({ id, type, title, subtitle, image });
    } else {
      // Tạm thời nếu chưa có player thật thì điều hướng tới trang chi tiết
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
          aria-label={`Phát ${title}`}
          onClick={handlePlayClick}
        >
          <Play size={22} fill="currentColor" color="currentColor" />
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

