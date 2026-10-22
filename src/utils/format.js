// src/utils/format.js

export function getInitials(name = "") {
  return (name || "?").trim().charAt(0).toUpperCase();
}

/**
 * Format thời lượng bài hát từ giây sang định dạng "m:ss" (ví dụ: 215s -> "3:35")
 */
export function formatDuration(seconds = 0) {
  const sec = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/**
 * Format tổng thời lượng danh sách bài hát (ví dụ: "1 giờ 15 phút" hoặc "45 phút")
 */
export function formatTotalDuration(seconds = 0) {
  const sec = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (hours > 0) {
    return `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ""}`.trim();
  }
  return `${minutes} phút`;
}

/**
 * Format số lượng có dấu phân tách hàng nghìn (ví dụ: 1021834 -> "1.021.834")
 */
export function formatNumber(num = 0) {
  return Number(num || 0).toLocaleString("vi-VN");
}

/**
 * Lấy năm phát hành từ chuỗi ngày (ví dụ: "2021-08-15" -> "2021")
 */
export function formatYear(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return isNaN(d.getFullYear()) ? "" : d.getFullYear();
}
