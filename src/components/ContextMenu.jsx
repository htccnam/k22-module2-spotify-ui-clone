// src/components/ContextMenu.jsx
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { libraryApi } from "../api/library";

export default function ContextMenu({ x, y, item, onClose, onChanged }) {
  const navigate = useNavigate();

  const run = async (fn, okMsg) => {
    try {
      await fn();
      toast.success(okMsg);
      onChanged(); // refresh lại danh sách
      onClose();
    } catch (e) {
      toast.error(e.message || "Thao tác thất bại");
    }
  };

  return (
    <div className="ctx-menu" style={{ left: x, top: y }}>
      <button
        className="ctx-item"
        onClick={() => {
          navigate(`/${item.type}/${item.id}`);
          onClose();
        }}
      >
        Xem trang chi tiết
      </button>

      {item.type === "playlist" && (
        <button
          className="ctx-item danger"
          onClick={() => {
            if (!window.confirm("Xóa playlist này?")) return;
            run(() => libraryApi.deletePlaylist(item.id), "Đã xóa playlist");
          }}
        >
          Xóa playlist
        </button>
      )}

      {item.type === "artist" && (
        <button
          className="ctx-item"
          onClick={() =>
            run(() => libraryApi.followArtist(item.id, "unfollow"), "Đã bỏ theo dõi")
          }
        >
          Bỏ theo dõi nghệ sĩ
        </button>
      )}

      {item.type === "album" && (
        <button
          className="ctx-item"
          onClick={() =>
            run(() => libraryApi.likeAlbum(item.id, "unlike"), "Đã bỏ thích album")
          }
        >
          Bỏ thích album
        </button>
      )}
    </div>
  );
}