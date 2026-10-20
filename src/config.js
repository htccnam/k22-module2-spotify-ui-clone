export const BASE_URL = "https://spotify.f8team.dev";

export function normalizeUrl(url) {
  if (!url) {
    return url;
  }
  return url.replace(/^http:\/\//i, "https://");
}
