// src/components/Section.jsx
/**
 * Section: Component bao bọc từng cụm danh mục trên Trang chủ.
 * Giúp tái sử dụng tiêu đề hàng mục và grid layout thống nhất.
 */
export default function Section({ title, children, actionText, onAction }) {
  if (!children) return null;

  return (
    <section className="home-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {actionText && (
          <button className="section-action-btn" onClick={onAction}>
            {actionText}
          </button>
        )}
      </div>
      <div className="media-grid">{children}</div>
    </section>
  );
}

