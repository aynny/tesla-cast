import { normalizeBrave } from '@/lib/brave';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
let started = 0;
let calls = 0;
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const key = process.env.BRAVE_SEARCH_API_KEY?.trim();
  if (params.get('config') === '1') return reply({ enabled: !!key });
  const q = (params.get('q') || '').trim();
  const offset = params.get('offset') || '0';
  if (!q || q.length > 200 || /[\u0000-\u001f]/.test(q) || !/^[0-9]$/.test(offset)) return reply({ message: '検索語を1〜200文字で入力してください。' }, 400);
  if (!key) return reply({ message: 'Brave検索は準備中です。サイト管理者によるAPI連携が必要です。' }, 503);
  if (Date.now() - started >= 60_000) { started = Date.now(); calls = 0; }
  // Best-effort per-process limit; provider account quotas must also be configured.
  if (calls >= 20) return reply({ message: '検索が混み合っています。少し待ってお試しください。' }, 429);
  calls++;
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.search = new URLSearchParams({ q, count: '10', offset, country: 'JP', search_lang: 'jp', ui_lang: 'ja-JP', safesearch: 'moderate', text_decorations: 'false', result_filter: 'web' }).toString();
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json', 'X-Subscription-Token': key }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) return reply({ message: response.status === 429 ? 'Brave検索の利用上限に達しています。時間をおいてお試しください。' : 'Brave検索に接続できませんでした。連携設定または通信状態をご確認ください。' }, response.status === 429 ? 429 : 502);
    const data = normalizeBrave(await response.json());
    return reply({ ...data, more: Number(offset) < 9 && data.more });
  } catch { return reply({ message: '検索の応答を取得できませんでした。もう一度お試しください。' }, 502); }
}
