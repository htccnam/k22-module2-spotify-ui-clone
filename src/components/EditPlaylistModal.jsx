// src/components/EditPlaylistModal.jsx
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { X, Camera, Loader2 } from "lucide-react";
import { detailsApi } from "../api/details";
import { normalizeUrl } from "../config";

/**
 * Modal sửa thông tin Playlist (Tên, Mô tả, Công khai, Tải lên ảnh bìa)
 * Đáp ứng yêu cầu 5.6 của đề bài.
 */
export default function EditPlaylistModal({ playlist, onClose, onSaved }) {
  const [name, setName] = useState(playlist.name || "");
  const [description, setDescription] = useState(playlist.description || "");
  const [isPublic, setIsPublic] = useState(playlist.is_public === 1 || playlist.is_public === true);
  const [coverPreview, setCoverPreview] = useState(
    playlist.image_url ? normalizeUrl(playlist.image_url) : null
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Vui lòng chọn một tệp hình ảnh");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Kích thước ảnh tối đa là 5MB");
    }

    setSelectedFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error("Tên playlist không được bỏ trống");
    }

    setSaving(true);
    try {
      // 1. Nếu người dùng có chọn ảnh mới, tải ảnh lên trước
      if (selectedFile) {
        await detailsApi.uploadPlaylistCover(playlist.id, selectedFile);
      }

      // 2. Cập nhật thông tin text (Tên, mô tả, public/private)
      await detailsApi.updatePlaylist(playlist.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic ? 1 : 0,
      });

      toast.success("Đã cập nhật playlist thành công");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || "Cập nhật playlist thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal edit-playlist-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        <h2 className="modal-title">Chỉnh sửa chi tiết</h2>

        <form onSubmit={handleSave} className="edit-playlist-form">
          <div className="edit-playlist-body">
            {/* Khung ảnh bìa có thể click để chọn ảnh */}
            <div
              className="edit-cover-wrap"
              onClick={() => fileInputRef.current?.click()}
              title="Chọn ảnh bìa mới"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="edit-cover-img" />
              ) : (
                <div className="edit-cover-placeholder">
                  <Camera size={44} />
                  <span>Chọn ảnh</span>
                </div>
              )}
              <div className="edit-cover-overlay">
                <Camera size={36} />
                <span>Thay đổi ảnh</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            {/* Các trường nhập Tên & Mô tả */}
            <div className="edit-fields-wrap">
              <div className="field">
                <label htmlFor="edit-name">Tên</label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Thêm tên playlist"
                  maxLength={100}
                />
              </div>

              <div className="field">
                <label htmlFor="edit-desc">Mô tả</label>
                <textarea
                  id="edit-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Thêm phần mô tả tùy chọn"
                  rows={4}
                  className="edit-textarea"
                />
              </div>

              {/* Chuyển đổi công khai / riêng tư (Public / Private) */}
              <div className="field-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <span>Công khai playlist này</span>
                </label>
              </div>
            </div>
          </div>

          <div className="edit-playlist-actions">
            <button
              type="submit"
              className="btn btn-white"
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="spin" /> : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

