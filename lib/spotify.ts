/** Normalize official content links; never use an arbitrary URL as an iframe source. */
export function spotifyContent(input: string): { embed: string; official: string } | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com' || url.username || url.password || url.port) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (/^intl-[a-z]{2}(?:-[a-z]{2})?$/i.test(parts[0] || '')) parts.shift();
    if (parts[0] === 'embed') parts.shift();
    const [type, id] = parts;
    if (parts.length !== 2 || !['track', 'album', 'playlist', 'artist', 'episode', 'show'].includes(type) || !/^[A-Za-z0-9]{22}$/.test(id)) return null;
    return { embed: `https://open.spotify.com/embed/${type}/${id}?theme=0`, official: `https://open.spotify.com/${type}/${id}` };
  } catch { return null; }
}
