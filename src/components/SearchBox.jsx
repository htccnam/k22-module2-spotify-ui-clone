// src/components/SearchBox.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, TrendingUp } from "lucide-react";
import { searchApi } from "../api/search";
import { useDebounce } from "../hooks/useDebounce";
import { normalizeUrl } from "../config";

export default function SearchBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [trending, setTrending] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!open) return;
    let active = true;
    if (!debouncedQuery) {
      searchApi.trending(8).then((data) => {
        if (active) setTrending(data.trending_searches || []);
      });
      return () => {
        active = false;
      };
    }
  }, [open, debouncedQuery]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    searchApi
      .universal(debouncedQuery)
      .then((data) => {
        if (active) {
          const {
            tracks = [],
            artists = [],
            albums = [],
            playlists = [],
          } = data.results || {};
          setResults([...tracks, ...artists, ...albums, ...playlists]);
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handlePick = (item) => {
    setOpen(false);
    setQuery("");
    navigate(`/${item.type}/${item.id}`); // /playlist/:id | /artist/:id | /album/:id | /track/:id
  };

  const total = results.length;

  return (
    <div className="search-wrap" ref={wrapRef}>
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          value={query}
          placeholder="Bạn muốn nghe gì?"
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && <Loader2 size={16} className="spin" />}
      </div>

      {open && (
        <div className="search-dropdown">
          {debouncedQuery.trim() === "" ? (
            <>
              {/* ---- HIỂN THỊ TRENDING ---- */}
              <p className="search-header">Trending searches</p>
              {trending.map((term) => (
                <button
                  key={term}
                  className="search-result"
                  onClick={() => setQuery(term)}
                >
                  <TrendingUp size={18} style={{ color: "#1ed760" }} />
                  <span className="result-title">{term}</span>
                </button>
              ))}
            </>
          ) : total === 0 && !loading ? (
            <p className="search-header">Không tìm thấy kết quả</p>
          ) : (
            <>
              {/* ---- HIỂN THỊ KẾT QUẢ ---- */}
              <p className="search-header">Kết quả ({total})</p>
              {results.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  className="search-result"
                  onClick={() => handlePick(item)}
                >
                  {item.image_url ? (
                    <img src={normalizeUrl(item.image_url)} alt="" />
                  ) : (
                    <span className="avatar-fallback">{item.title?.[0]}</span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p className="result-title">{item.title}</p>
                    <p className="result-sub">{item.subtitle}</p>
                  </div>
                  <span className="result-type-badge">{item.type}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
