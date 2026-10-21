// src/pages/DetailPlaceholder.jsx
import { useParams } from "react-router-dom";
export default function DetailPlaceholder() {
  const { id } = useParams();
  return (
    <div>
      <h1>Trang chi tiết</h1>
      <p style={{ color: "var(--text-sub)" }}>
        ID = {id} — sẽ được xây dựng đầy đủ ở Phase 5.
      </p>
    </div>
  );
}
