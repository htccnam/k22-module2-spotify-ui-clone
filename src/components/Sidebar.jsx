// src/components/Sidebar.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, LayoutGrid, LayoutList, Rows3, Plus, Search, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { libraryApi } from "../api/library";
import { normalizeUrl } from "../config";
import ContextMenu from "./ContextMenu";
import CreatePlaylistModal from "./CreatePlaylistModal";
import Tooltip from "./Tooltip";

// 4 chế độ view (Spotify thật có đúng 4 cái này)
const VIEW_MODES = [
  { key: "list", label: "Danh sách", icon: List },
  { key: "grid", label: "Lưới", icon: LayoutGrid },
  { key: "grid-dense", label: "Lưới dày", icon: LayoutList },
  { key: "compact", label: "Thu gọn", icon: Rows3 },
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

  // 5.2: State tìm kiếm trong Sidebar
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

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

  // 2. Lọc + Tìm kiếm + Sắp xếp (DẪN XUẤT — không cần state mới, dùng useMemo)
  const visible = useMemo(() => {
    let list = items;
    if (filter !== "all") list = list.filter((i) => i.type === filter);

    // 5.2: Lọc theo từ khóa tìm kiếm trong Sidebar
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.subtitle?.toLowerCase().includes(q),
      );
    }

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
  }, [items, filter, sort, searchQuery]);

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
          <Tooltip text="Tạo danh sách phát" position="top">
            <button
              className="icon-btn"
              onClick={() => setShowCreate(true)}
              aria-label="Tạo playlist"
            >
              <Plus size={18} />
            </button>
          </Tooltip>
          {VIEW_MODES.map(({ key, label, icon: Icon }) => (
            <Tooltip key={key} text={label} position="top">
              <button
                className={`icon-btn ${view === key ? "active" : ""}`}
                onClick={() => setView(key)}
                aria-label={label}
              >
                <Icon size={18} />
              </button>
            </Tooltip>
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

      {/* 5.2: Controls gồm Search trong thư viện + Sort dropdown */}
      <div className="lib-controls">
        {searchOpen ? (
          <div className="lib-search-input-wrap">
            <Search size={14} className="lib-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="lib-search-input"
              placeholder="Tìm kiếm trong Thư viện"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  if (searchQuery) setSearchQuery("");
                  else setSearchOpen(false);
                }
              }}
            />
            <button
              className="lib-search-clear"
              onClick={() => {
                setSearchQuery("");
                setSearchOpen(false);
              }}
              title="Đóng tìm kiếm"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <Tooltip text="Tìm kiếm trong Thư viện" position="top">
            <button
              className="icon-btn lib-search-toggle"
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              aria-label="Tìm kiếm trong Thư viện"
            >
              <Search size={16} />
            </button>
          </Tooltip>
        )}

        <div className="lib-sort">
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* danh sách items, hiển thị theo view mode */}
      <div className={`lib-list view-${view}`}>
        {loading ? (
          <p className="lib-empty">Đang tải...</p>
        ) : visible.length === 0 ? (
          <p className="lib-empty">
            {searchQuery ? "Không tìm thấy kết quả phù hợp" : "Thư viện trống"}
          </p>
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
                <img
                  src={normalizeUrl(item.image)}
                  alt={item.title}
                  className={item.type === "artist" ? "avatar-fallback" : ""}
                />
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
