// src/components/Sidebar.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, LayoutGrid, LayoutList, Rows3, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { libraryApi } from "../api/library";
import { normalizeUrl } from "../config";
import ContextMenu from "./ContextMenu";
import CreatePlaylistModal from "./CreatePlaylistModal";

// 4 chế độ view (Spotify thật có đúng 4 cái này)
const VIEW_MODES = [
  { key: "list", icon: List },
  { key: "grid", icon: LayoutGrid },
  { key: "grid-dense", icon: LayoutList },
  { key: "compact", icon: Rows3 },
];

const FILTERS = ["all", "playlists", "artists", "albums"];
const SORTS = [
  { key: "recent", label: "Recent" },
  { key: "alphabetical", label: "Alphabetical" },
  { key: "creator", label: "Creator" },
];

export default function Sidebar() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState("list"); // chế độ hiển thị
  const [filter, setFilter] = useState("all"); // bộ lọc
  const [sort, setSort] = useState("recent"); // sắp xếp
  const [items, setItems] = useState([]); // dữ liệu đã "đồng phục"
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [menu, setMenu] = useState(null); // { x, y, item }

  // 1. Fetch khi user đã đăng nhập (dùng Promise.allSettled)
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const [p, a, f] = await Promise.allSettled([
        libraryApi.myPlaylists(),
        libraryApi.myAlbums(),
        libraryApi.myArtists(),
      ]);
      if (!active) return;
      // Chuẩn hoá 3 nguồn về 1 hình dạng đồng phục
      const playlists = (
        p.status === "fulfilled" ? (p.value?.playlists ?? []) : []
      ).map((x) => ({
        ts: x.created_at,
        type: "playlist",
        id: x.id,
        title: x.name,
        subtitle: `${x.user_display_name || "Playlist"} • ${x.total_tracks} bài`,
        image: x.image_url,
      }));
      const albums = (
        a.status === "fulfilled" ? (a.value?.albums ?? []) : []
      ).map((x) => ({
        ts: x.saved_at ?? x.created_at,
        type: "album",
        id: x.id,
        title: x.title,
        subtitle: x.artist_name,
        image: x.cover_image_url,
      }));
      const artists = (
        f.status === "fulfilled" ? (f.value?.artists ?? []) : []
      ).map((x) => ({
        ts: x.followed_at ?? x.created_at,
        type: "artist",
        id: x.id,
        title: x.name,
        subtitle: "Nghệ sĩ",
        image: x.image_url,
      }));
      setItems([...playlists, ...albums, ...artists]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated, reloadKey]);

  // 2. Lọc + sắp (DẪN XUẤT — không cần state mới, dùng useMemo)
  const visible = useMemo(() => {
    let list = items;
    if (filter !== "all") list = list.filter((i) => i.type === filter);

    if (sort === "alphabetical") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "creator") {
      list = [...list].sort((a, b) =>
        (a.subtitle ?? "").localeCompare(b.subtitle ?? ""),
      );
    } else {
      // "recent" — mới nhất lên đầu
      list = [...list].sort((a, b) => new Date(b.ts) - new Date(a.ts));
    }
    return list;
  }, [items, filter, sort]); // ← giờ sort được dùng thật, hết vọc "unnecessary dependency"

  // Đóng context menu khi click ra ngoài / cuộn / bấm Esc
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const closeKey = (e) => e.key === "Escape" && setMenu(null);
    document.addEventListener("click", close);
    document.addEventListener("scroll", close, true);
    document.addEventListener("keydown", closeKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", close, true);
      document.removeEventListener("keydown", closeKey);
    };
  }, [menu]);

  return (
    <aside className="sidebar">
      {/* header Library: title + 4 nút view mode + nút + (tạo playlist) */}
      <div className="lib-header">
        <span className="lib-title">Thư viện</span>
        <div className="lib-actions">
          <button
            className="icon-btn"
            title="Tạo playlist"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={18} />
          </button>
          {VIEW_MODES.map(({ key, icon: Icon }) => (
            <button
              key={key}
              className={`icon-btn ${view === key ? "active" : ""}`}
              onClick={() => setView(key)}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* filter chips */}
      <div className="lib-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`chip ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="lib-sort">
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* danh sách items, hiển thị theo view mode */}
      <div className={`lib-list view-${view}`}>
        {loading ? (
          <p className="lib-empty">Đang tải...</p>
        ) : visible.length === 0 ? (
          <p className="lib-empty">Thư viện trống</p>
        ) : (
          visible.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              className="lib-item"
              onClick={() => navigate(`/${item.type}/${item.id}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenu({ x: e.clientX, y: e.clientY, item });
              }}
            >
              {view !== "compact" && item.image ? (
                <img src={normalizeUrl(item.image)} alt="" />
              ) : (
                <span className="avatar-fallback">{item.title?.[0]}</span>
              )}
              <div className="lib-item-text">
                <p className="result-title">{item.title}</p>
                {view !== "compact" && (
                  <p className="result-sub">{item.subtitle}</p>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          item={menu.item}
          onClose={() => setMenu(null)}
          onChanged={() => setReloadKey((k) => k + 1)}
        />
      )}

      {showCreate && (
        <CreatePlaylistModal
          onClose={() => setShowCreate(false)}
          onCreated={() => setReloadKey((k) => k + 1)}
        />
      )}
    </aside>
  );
}
