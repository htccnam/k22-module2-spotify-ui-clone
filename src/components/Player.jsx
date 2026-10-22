// src/components/Player.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Music,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { normalizeUrl } from "../config";
import { formatDuration } from "../utils/format";
import { detailsApi } from "../api/details";
import Tooltip from "./Tooltip";

export default function Player() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      setIsLiked(Boolean(currentTrack.is_liked));
    }
  }, [currentTrack]);

  const handleToggleLike = async () => {
    if (!currentTrack) return;
    try {
      await detailsApi.likeTrack(currentTrack.id, isLiked ? "unlike" : "like");
      setIsLiked(!isLiked);
      toast.success(
        isLiked ? "Đã xóa khỏi bài hát yêu thích" : "Đã thêm vào bài hát yêu thích"
      );
    } catch (err) {
      toast.error(err.message || "Thao tác thất bại");
    }
  };

  const handleSeek = (e) => {
    seek(Number(e.target.value));
  };

  const handleVolume = (e) => {
    setVolume(Number(e.target.value));
  };

  const trackDuration = duration || currentTrack?.duration || 0;
  const progressPercent =
    trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  // Lựa chọn icon âm lượng phù hợp
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <footer className="player-bar">
      {/* 1. Phần thông tin bài hát đang phát (Bên trái) */}
      <div className="player-left">
        {currentTrack ? (
          <>
            <div className="player-thumb-wrap">
              {currentTrack.image_url || currentTrack.album_cover_image_url ? (
                <img
                  src={normalizeUrl(
                    currentTrack.image_url || currentTrack.album_cover_image_url
                  )}
                  alt={currentTrack.title}
                  className="player-thumb"
                />
              ) : (
                <div className="player-thumb-fallback">
                  <Music size={20} />
                </div>
              )}
            </div>

            <div className="player-info">
              <Link
                to={`/track/${currentTrack.id}`}
                className="player-title"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </Link>
              {currentTrack.artist_name && (
                <span className="player-artist" title={currentTrack.artist_name}>
                  {currentTrack.artist_id ? (
                    <Link to={`/artist/${currentTrack.artist_id}`}>
                      {currentTrack.artist_name}
                    </Link>
                  ) : (
                    currentTrack.artist_name
                  )}
                </span>
              )}
            </div>

            <Tooltip
              text={isLiked ? "Xóa khỏi bài hát yêu thích" : "Lưu vào bài hát yêu thích"}
              position="top"
            >
              <button
                className={`player-like-btn ${isLiked ? "is-liked" : ""}`}
                onClick={handleToggleLike}
                aria-label="Thích bài hát"
              >
                <Heart
                  size={18}
                  fill={isLiked ? "var(--accent)" : "none"}
                  color={isLiked ? "var(--accent)" : "currentColor"}
                />
              </button>
            </Tooltip>
          </>
        ) : (
          <div className="player-empty-info">
            <span className="player-title">Chưa chọn bài hát</span>
          </div>
        )}
      </div>

      {/* 2. Điều khiển phát nhạc & Thanh tua (Ở giữa) */}
      <div className="player-center">
        <div className="player-controls">
          {/* Nút Shuffle */}
          <Tooltip
            text={isShuffle ? "Tắt phát ngẫu nhiên" : "Bật phát ngẫu nhiên"}
            position="top"
          >
            <button
              className={`player-btn ${isShuffle ? "text-accent is-active" : ""}`}
              onClick={toggleShuffle}
              disabled={!currentTrack}
              aria-label="Phát ngẫu nhiên"
            >
              <Shuffle size={18} />
            </button>
          </Tooltip>

          {/* Nút Previous */}
          <Tooltip text="Trước đó" position="top">
            <button
              className="player-btn"
              onClick={prevTrack}
              disabled={!currentTrack}
              aria-label="Bài trước đó"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>
          </Tooltip>

          {/* Nút Play / Pause tròn màu trắng */}
          <Tooltip text={isPlaying ? "Tạm dừng" : "Phát"} position="top">
            <button
              className="player-btn-play"
              onClick={togglePlay}
              disabled={!currentTrack}
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" />
              )}
            </button>
          </Tooltip>

          {/* Nút Next */}
          <Tooltip text="Tiếp theo" position="top">
            <button
              className="player-btn"
              onClick={nextTrack}
              disabled={!currentTrack}
              aria-label="Bài tiếp theo"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
          </Tooltip>

          {/* Nút Repeat */}
          <Tooltip
            text={
              repeatMode === "one"
                ? "Lặp lại một bài"
                : repeatMode === "all"
                ? "Lặp lại tất cả"
                : "Bật lặp lại"
            }
            position="top"
          >
            <button
              className={`player-btn ${repeatMode !== "off" ? "text-accent is-active" : ""}`}
              onClick={toggleRepeat}
              disabled={!currentTrack}
              aria-label="Lặp lại"
            >
              {repeatMode === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </Tooltip>
        </div>

        {/* Thanh tua thời gian (Seek Bar) */}
        <div className="player-progress-bar">
          <span className="player-time">{formatDuration(currentTime)}</span>
          <div className="progress-slider-wrap">
            <input
              type="range"
              min="0"
              max={trackDuration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={!currentTrack}
              className="progress-slider"
              style={{ "--progress": `${progressPercent}%` }}
              aria-label="Thanh tua nhạc"
            />
          </div>
          <span className="player-time">{formatDuration(trackDuration)}</span>
        </div>
      </div>

      {/* 3. Âm lượng (Bên phải) */}
      <div className="player-right">
        <Tooltip text={isMuted ? "Bật âm thanh" : "Tắt tiếng"} position="top">
          <button
            className="player-btn"
            onClick={toggleMute}
            aria-label="Âm lượng"
          >
            <VolumeIcon size={20} />
          </button>
        </Tooltip>

        <div className="volume-slider-wrap">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="progress-slider volume-slider"
            style={{ "--progress": `${volumePercent}%` }}
            aria-label="Âm lượng"
          />
        </div>
      </div>
    </footer>
  );
}

