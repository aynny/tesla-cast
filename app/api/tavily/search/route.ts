import { normalizeTavily } from '@/lib/tavily';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
let started = 0;
let calls = 0;
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const key = process.env.TAVILY_API_KEY?.trim();
  if (params.get('config') === '1') return reply({ enabled: !!key });
  const q = (params.get('q') || '').trim();
  if (!q || q.length > 200 || /[\u0000-\u001f]/.test(q)) return reply({ message: '検索語を1〜200文字で入力してください。' }, 400);
  if (!key) return reply({ message: 'Tavily検索は準備中です。サイト管理者によるAPI連携が必要です。' }, 503);
  if (Date.now() - started >= 60_000) { started = Date.now(); calls = 0; }
  // Best-effort per-process limit; provider account quotas must also be configured.
  if (calls >= 20) return reply({ message: '検索が混み合っています。少し待ってお試しください。' }, 429);
  calls++;
  try {
    const response = await fetch('https://api.tavily.com/search', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ query: q, search_depth: 'basic', auto_parameters: false, max_results: 10, topic: 'general', include_answer: false, include_raw_content: false, safe_search: true }), cache: 'no-store', signal: AbortSignal.timeout(10000) });
    const limited = [429, 432, 433].includes(response.status);
    if (!response.ok) return reply({ message: limited ? 'Tavily検索の利用上限に達しています。時間をおいてお試しください。' : 'Tavily検索に接続できませんでした。連携設定または通信状態をご確認ください。' }, limited ? 429 : 502);
    const data = normalizeTavily(await response.json());
    return reply(data);
  } catch { return reply({ message: '検索の応答を取得できませんでした。もう一度お試しください。' }, 502); }
}
