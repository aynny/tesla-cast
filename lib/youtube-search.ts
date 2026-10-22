export type SearchVideo = { id: string; title: string; channel: string; thumbnail: string };
export type SearchResults = { videos: SearchVideo[]; nextPageToken?: string };

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}
// Titles remain plain text, including when Google returns encoded markup.
const entities: Record<string, string> = {
    '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&#39;': "'", '&#x27;': "'",
};
function plainText(value: string): string {
  return value.replace(/&(amp|quot|apos|lt|gt|#39|#x27);/g, token => entities[token] ?? token);
}
export function searchResults(value: unknown): SearchResults {
  const data = object(value);
  if (!Array.isArray(data.items)) throw new Error('Invalid search response');
  const seen = new Set<string>();
  const videos = data.items.flatMap(item => {
    const entry = object(item), id = object(entry.id).videoId, snippet = object(entry.snippet);
    if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(id) || seen.has(id) || typeof snippet.title !== 'string') return [];
    seen.add(id);
    return [{ id, title: plainText(snippet.title), channel: typeof snippet.channelTitle === 'string' ? plainText(snippet.channelTitle) : '', thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg` }];
  });
  const token = data.nextPageToken;
  return { videos, ...(typeof token === 'string' && /^[A-Za-z0-9_-]{1,256}$/.test(token) ? { nextPageToken: token } : {}) };
}
