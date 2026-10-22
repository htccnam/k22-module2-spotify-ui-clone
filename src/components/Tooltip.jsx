// src/components/Tooltip.jsx
import { useState, useRef } from "react";

/**
 * Tooltip: Component hiển thị chú thích nhỏ kiểu Spotify khi người dùng hover vào icon.
 *
 * @param {React.ReactNode} children - Nút hoặc icon cần gắn tooltip
 * @param {string} text - Nội dung chú thích
 * @param {"top" | "bottom" | "left" | "right"} position - Hướng hiển thị tooltip
 * @param {number} delay - Độ trễ trước khi hiện (ms), mặc định 200ms
 */
export default function Tooltip({
  children,
  text,
  position = "top",
  delay = 200,
}) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  if (!text) return children;

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  };

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {visible && (
        <div className={`tooltip-bubble tooltip-${position}`} role="tooltip">
          {text}
        </div>
      )}
    </div>
  );
}

