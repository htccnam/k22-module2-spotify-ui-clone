export function getInitials(name = "") {
  return (name || "?").trim().charAt(0).toUpperCase();
}
