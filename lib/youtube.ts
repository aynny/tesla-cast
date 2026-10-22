/** Accept video links only. Never pass a user-supplied URL to the iframe. */
export function youtubeVideoId(input: string): string | null {
  const value = input.trim();
  const valid = (id: string | null) => id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  if (valid(value)) return value;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.port) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.hostname === "youtu.be" && parts.length === 1) return valid(parts[0]);
    if (!["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"].includes(url.hostname)) return null;
    if (url.pathname === "/watch") return valid(url.searchParams.get("v"));
    if (parts.length === 2 && ["shorts", "live", "embed"].includes(parts[0])) return valid(parts[1]);
    return null;
  } catch {
    return null;
  }
}
