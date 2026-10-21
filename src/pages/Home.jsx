// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { browseApi } from "../api/browse";
import Section from "../components/Section";
import MediaCard from "../components/MediaCard";

/**
 * Tính toán câu chào theo giờ thực tế trong ngày
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Chào buổi sáng";
  if (hour >= 12 && hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    artists: [],
    albums: [],
    playlists: [],
    tracks: [],
  });

  useEffect(() => {
    let active = true;

    async function fetchHomeData() {
      setLoading(true);

      // Senior pattern: Dùng Promise.allSettled thay vì Promise.all
      // Lý do: Nếu 1 trong 4 API bị lỗi (ví dụ API Playlists bảo trì),
      // 3 API còn lại vẫn hiển thị bình thường, trang chủ không bị sập hoàn toàn.
      const [artistsResult, albumsResult, playlistsResult, tracksResult] =
        await Promise.allSettled([
          browseApi.getTrendingArtists(6),
          browseApi.getPopularAlbums(6),
          browseApi.getPlaylists(6),
          browseApi.getTrendingTracks(6),
        ]);

      if (!active) return;

      setData({
        artists:
          artistsResult.status === "fulfilled"
            ? artistsResult.value.artists || []
            : [],
        albums:
          albumsResult.status === "fulfilled"
            ? albumsResult.value.albums || []
            : [],
        playlists:
          playlistsResult.status === "fulfilled"
            ? playlistsResult.value.playlists || []
            : [],
        tracks:
          tracksResult.status === "fulfilled"
            ? tracksResult.value.tracks || []
            : [],
      });

      setLoading(false);
    }

    fetchHomeData();

    // Cleanup function để tránh race-condition khi StrictMode mount 2 lần
    return () => {
      active = false;
    };
  }, []);

  const greeting = getGreeting();

  return (
    <div className="home-page">
      {/* 1. Header lời chào */}
      <header className="home-header">
        <h1 className="home-greeting">{greeting}</h1>
      </header>

      {/* 2. Loading Skeleton khi đang tải */}
      {loading ? (
        <div className="home-loading">
          {[1, 2, 3].map((sectionIndex) => (
            <div key={sectionIndex} className="skeleton-section">
              <div className="skeleton-title shimmer" />
              <div className="media-grid">
                {[1, 2, 3, 4, 5, 6].map((cardIndex) => (
                  <div key={cardIndex} className="skeleton-card shimmer" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="home-content">
          {/* Section 1: Nghệ sĩ thịnh hành */}
          {data.artists.length > 0 && (
            <Section title="Nghệ sĩ thịnh hành">
              {data.artists.map((artist) => (
                <MediaCard
                  key={artist.id}
                  id={artist.id}
                  type="artist"
                  title={artist.name}
                  subtitle="Nghệ sĩ"
                  image={artist.image_url}
                  isRound={true}
                />
              ))}
            </Section>
          )}

          {/* Section 2: Album phổ biến */}
          {data.albums.length > 0 && (
            <Section title="Album phổ biến">
              {data.albums.map((album) => (
                <MediaCard
                  key={album.id}
                  id={album.id}
                  type="album"
                  title={album.title}
                  subtitle={album.artist_name || "Album"}
                  image={album.cover_image_url || album.image_url}
                />
              ))}
            </Section>
          )}

          {/* Section 3: Tuyển tập & Playlist nổi bật */}
          {data.playlists.length > 0 && (
            <Section title="Playlist nổi bật">
              {data.playlists.map((playlist) => (
                <MediaCard
                  key={playlist.id}
                  id={playlist.id}
                  type="playlist"
                  title={playlist.name}
                  subtitle={
                    playlist.description ||
                    `${playlist.total_tracks || 0} bài hát`
                  }
                  image={playlist.image_url}
                />
              ))}
            </Section>
          )}

          {/* Section 4: Bài hát thịnh hành */}
          {data.tracks.length > 0 && (
            <Section title="Bài hát thịnh hành">
              {data.tracks.map((track) => (
                <MediaCard
                  key={track.id}
                  id={track.id}
                  type="track"
                  title={track.title}
                  subtitle={track.artist_name || "Bài hát"}
                  image={track.image_url}
                />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
