// src/components/CreatePlaylistModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";
import { libraryApi } from "../api/library";

export default function CreatePlaylistModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Tên playlist không được bỏ trống");
    setSubmitting(true);
    try {
      await libraryApi.createPlaylist({
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: true,
      });
      toast.success("Đã tạo playlist");
      onCreated(); // báo Sidebar: refresh lại danh sách
      onClose(); // đóng modal
    } catch (err) {
      toast.error(err.message || "Tạo playlist thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 style={{ marginBottom: 16 }}>Tạo Playlist</h2>
        <form onSubmit={submit}>
          <div className="field">
            <label>Tên playlist *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="vd: Nhạc đi làm"
              autoFocus
            />
          </div>
          <div className="field">
            <label>Mô tả (tuỳ chọn)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả..."
            />
          </div>
          <button className="btn-primary" disabled={submitting}>
            {submitting ? <Loader2 size={18} className="spin" /> : "Tạo"}
          </button>
        </form>
      </div>
    </div>
  );
}
