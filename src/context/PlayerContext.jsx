// src/context/PlayerContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { normalizeUrl } from "../config";
import { api } from "../api/client";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // "off" | "all" | "one"

  // 1. Đồng bộ Volume & Mute với thẻ Audio
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // 2. Phát một bài hát mới (kèm cập nhật hàng đợi Queue)
  const playTrack = (track, newQueue = null) => {
    if (!track) return;

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    } else if (queue.length === 0) {
      setQueue([track]);
      setCurrentIndex(0);
    } else {
      const idx = queue.findIndex((t) => t.id === track.id);
      if (idx !== -1) setCurrentIndex(idx);
      else {
        setQueue((prev) => [...prev, track]);
        setCurrentIndex(queue.length);
      }
    }

    setCurrentTrack(track);
    setCurrentTime(0);

    // Gửi request ghi nhận lượt phát (background fire-and-forget)
    if (track.id) {
      api.post(`/api/tracks/${track.id}/play`).catch(() => {});
    }
  };

  // 3. Tải và phát bài hát khi currentTrack thay đổi
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (currentTrack.audio_url) {
      const src = normalizeUrl(currentTrack.audio_url);
      audio.src = src;
      audio.load();
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      setIsPlaying(false);
    }
  }, [currentTrack]);

  // 4. Toggle Play/Pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // 5. Bài tiếp theo (Next)
  const nextTrack = () => {
    if (queue.length === 0) return;

    let nextIdx;
    if (isShuffle) {
      // Chọn ngẫu nhiên một bài khác bài hiện tại
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = currentIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeatMode === "all") {
          nextIdx = 0;
        } else {
          return; // Hết danh sách và không bật lặp lại tất cả
        }
      }
    }

    setCurrentIndex(nextIdx);
    setCurrentTrack(queue[nextIdx]);
  };

  // 6. Bài trước đó (Previous)
  const prevTrack = () => {
    const audio = audioRef.current;
    // Nếu bài đang phát hơn 3 giây thì quay lại đầu bài hát
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    setCurrentIndex(prevIdx);
    setCurrentTrack(queue[prevIdx]);
  };

  // 7. Kéo tua (Seek)
  const seek = (time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  // 8. Chuyển đổi trạng thái Lặp lại (off -> all -> one -> off)
  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  // 9. Chuyển đổi Xáo trộn (Shuffle)
  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  // 10. Chuyển đổi Mute
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // 11. Xử lý sự kiện khi kết thúc bài hát (Ended)
  const handleEnded = () => {
    if (repeatMode === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      nextTrack();
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        currentIndex,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

