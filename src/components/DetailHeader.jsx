// src/components/DetailHeader.jsx
import { normalizeUrl } from "../config";
import { getInitials } from "../utils/format";
import { Edit2, Music } from "lucide-react";

/**
 * DetailHeader: Banner hero lớn phong cách Spotify ở đầu trang chi tiết.
 */
export default function DetailHeader({
  type = "PLAYLIST",
  title = "",
  description = "",
  image = null,
  isRound = false,
  meta = [],
  isEditable = false,
  onEdit,
}) {
  const normalizedImage = image ? normalizeUrl(image) : null;

  return (
    <div className={`detail-hero ${isRound ? "is-artist-hero" : ""}`}>
      {/* 1. Ảnh bìa lớn */}
      <div
        className={`detail-hero-cover-wrap ${isEditable ? "is-clickable" : ""}`}
        onClick={isEditable ? onEdit : undefined}
        title={isEditable ? "Nhấn để thay đổi ảnh bìa và thông tin" : undefined}
      >
        {normalizedImage ? (
          <img
            src={normalizedImage}
            alt={title}
            className={`detail-hero-cover ${isRound ? "is-round" : ""}`}
          />
        ) : (
          <div className={`detail-hero-fallback ${isRound ? "is-round" : ""}`}>
            {isRound ? getInitials(title) : <Music size={64} />}
          </div>
        )}

        {isEditable && (
          <div className="detail-hero-overlay">
            <Edit2 size={32} />
            <span>Chọn ảnh</span>
          </div>
        )}
      </div>

      {/* 2. Khối thông tin chi tiết */}
      <div className="detail-hero-content">
        <span className="detail-type-badge">{type}</span>

        <h1
          className={`detail-title ${isEditable ? "is-editable-title" : ""}`}
          onClick={isEditable ? onEdit : undefined}
          title={isEditable ? "Nhấn để sửa tên" : undefined}
        >
          {title}
        </h1>

        {description && <p className="detail-desc">{description}</p>}

        {meta && meta.length > 0 && (
          <div className="detail-meta">
            {meta.map((item, index) => (
              <span key={index} className="detail-meta-item">
                {index > 0 && <span className="detail-meta-dot">•</span>}
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

