import { searchResults, type SearchResults } from '../../../../lib/youtube-search';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const cache = new Map<string, { expires: number; data: SearchResults }>();
let windowStart = 0;
let calls = 0;
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get('q') ?? '').trim();
  const pageToken = params.get('pageToken') ?? '';
  if (!query || query.length > 100 || /[\u0000-\u001f]/.test(query) || (pageToken && !/^[A-Za-z0-9_-]{1,256}$/.test(pageToken))) {
    return reply({ message: '検索キーワードを1〜100文字で入力してください。' }, 400);
  }
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return reply({ code: 'NOT_CONFIGURED', message: '検索の準備中です。サイト管理者によるYouTube連携の設定が必要です。' }, 503);
  const cacheKey = JSON.stringify([query, pageToken]);
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > now) return reply(cached.data);
  if (now - windowStart >= 60_000) { windowStart = now; calls = 0; }
  // Best-effort protection per process. Google Cloud quotas remain authoritative.
  if (calls >= 20) return reply({ message: '検索が混み合っています。1分ほど待って、もう一度お試しください。' }, 429);
  calls++;
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.search = new URLSearchParams({ key, part: 'snippet', type: 'video', q: query, maxResults: '12', videoEmbeddable: 'true', videoSyndicated: 'true', relevanceLanguage: 'ja', ...(pageToken ? { pageToken } : {}) }).toString();
  try {
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    if (!response.ok) {
      // Never return upstream error bodies or URLs containing the API key.
      return reply({ message: response.status === 403 || response.status === 429 ? 'YouTube検索の利用上限、または連携設定により検索できません。時間をおいて再度お試しください。' : 'YouTube検索に接続できませんでした。もう一度お試しください。' }, response.status === 403 || response.status === 429 ? 503 : 502);
    }
    const data = searchResults(await response.json());
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(cacheKey, { expires: now + 10 * 60_000, data });
    return reply(data);
  } catch {
    return reply({ message: '検索の応答がありません。通信状態を確認して、もう一度お試しください。' }, 502);
  }
}
