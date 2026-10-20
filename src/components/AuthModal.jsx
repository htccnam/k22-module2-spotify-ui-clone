// src/components/AuthModal.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(pw) {
  const errors = [];
  if (pw.length < 6) errors.push("tối thiểu 6 ký tự");
  if (!/[A-Z]/.test(pw)) errors.push("1 chữ hoa");
  if (!/[a-z]/.test(pw)) errors.push("1 chữ thường");
  if (!/\d/.test(pw)) errors.push("1 chữ số");
  return errors;
}

export default function AuthModal() {
  const { authModal, closeAuthModal, switchAuthMode } = useUI();
  const { login, register } = useAuth();
  const mode = authModal.mode;

  const [form, setForm] = useState({
    username: "",
    email: "",
    display_name: "",
    password: "",
    confirm: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form mỗi khi mở / đổi tab
  useEffect(() => {
    if (authModal.open) {
      setForm({
        username: "",
        email: "",
        display_name: "",
        password: "",
        confirm: "",
      });
      setFieldErrors({});
    }
  }, [authModal.open, mode]);

  // ESC để đóng modal
  useEffect(() => {
    if (!authModal.open) return;
    const onKey = (e) => e.key === "Escape" && closeAuthModal();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [authModal.open, closeAuthModal]);

  if (!authModal.open) return null;

  const set = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!EMAIL_RE.test(form.email)) errs.email = "Email không hợp lệ";
    if (mode === "signup") {
      if (form.username.trim().length < 3)
        errs.username = "Tên tài khoản tối thiểu 3 ký tự";
      const pwErrors = validatePassword(form.password);
      if (pwErrors.length)
        errs.password = "Mật khẩu cần: " + pwErrors.join(", ");
      if (form.confirm !== form.password)
        errs.confirm = "Mật khẩu xác nhận không khớp";
    } else if (!form.password) {
      errs.password = "Vui lòng nhập mật khẩu";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
        toast.success("Đăng nhập thành công");
      } else {
        await register({
          username: form.username.trim(),
          email: form.email,
          password: form.password,
          display_name: form.display_name?.trim() || form.username.trim(),
        });
        toast.success("Đăng ký thành công");
      }
      closeAuthModal();
    } catch (error) {
      // Lỗi server: gắn vào field nếu có details, không thì toast
      const serverErrs = {};
      (error.details || []).forEach((d) => {
        if (d.field) serverErrs[d.field] = d.message;
      });
      if (Object.keys(serverErrs).length)
        setFieldErrors((s) => ({ ...s, ...serverErrs }));
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={closeAuthModal}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeAuthModal}>
          <X size={20} />
        </button>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchAuthMode("login")}
          >
            Đăng nhập
          </button>
          <button
            className={`modal-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => switchAuthMode("signup")}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="field">
                <label>Tên tài khoản</label>
                <input
                  value={form.username}
                  onChange={set("username")}
                  placeholder="vd: dungvq"
                />
                {fieldErrors.username && (
                  <p className="field-error">{fieldErrors.username}</p>
                )}
              </div>
              <div className="field">
                <label>Tên hiển thị (tuỳ chọn)</label>
                <input
                  value={form.display_name}
                  onChange={set("display_name")}
                  placeholder="Tên hiển thị"
                />
              </div>
            </>
          )}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="field-error">{fieldErrors.email}</p>
            )}
          </div>

          <div className="field">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
            />
            {fieldErrors.password && (
              <p className="field-error">{fieldErrors.password}</p>
            )}
          </div>

          {mode === "signup" && (
            <div className="field">
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                value={form.confirm}
                onChange={set("confirm")}
                placeholder="••••••••"
              />
              {fieldErrors.confirm && (
                <p className="field-error">{fieldErrors.confirm}</p>
              )}
            </div>
          )}

          <button
            className="btn-primary"
            disabled={submitting}
            style={{ marginTop: 8 }}
          >
            {submitting ? (
              <Loader2
                size={18}
                style={{ margin: "0 auto" }}
                className="spin"
              />
            ) : mode === "login" ? (
              "Đăng nhập"
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>

        <p className="modal-footer">
          {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button
            onClick={() =>
              switchAuthMode(mode === "login" ? "signup" : "login")
            }
          >
            {mode === "login" ? "Đăng ký" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
}
