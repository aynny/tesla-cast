export const SPOTIFY_CLIENT_ID = '5ce899514731461c8e42d1c19169c3f4';
export const SPOTIFY_REDIRECT = 'https://tesla-cast.vercel.app/spotify/callback';
const AUTH_KEY = 'tesla.spotify.auth';
const PENDING_KEY = 'tesla.spotify.pending';
type Tokens = { access: string; refresh: string; expires: number };
type Pending = { state: string; verifier: string; created: number };
let refreshing: Promise<string> | null = null;
let generation = 0;
export function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export async function pkceChallenge(verifier: string) {
  return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
}
export function validPending(value: unknown, state: string | null, now = Date.now()): value is Pending {
  const p = value as Partial<Pending> | null;
  return !!p && typeof state === 'string' && state.length > 0 && p.state === state && typeof p.verifier === 'string' && /^[A-Za-z0-9_-]{43,128}$/.test(p.verifier) && typeof p.created === 'number' && now >= p.created && now - p.created < 600_000;
}
export function disconnectSpotify() {
  generation++;
  sessionStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(PENDING_KEY);
}
export function hasSpotifySession() {
  try { return !!JSON.parse(sessionStorage.getItem(AUTH_KEY) || 'null')?.refresh; } catch { return false; }
}
export async function loginSpotify() {
  if (location.origin !== 'https://tesla-cast.vercel.app') {
    location.assign('https://tesla-cast.vercel.app/spotify'); return;
  }
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(64)));
  const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = await pkceChallenge(verifier);
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ verifier, state, created: Date.now() }));
  const query = new URLSearchParams({ client_id: SPOTIFY_CLIENT_ID, response_type: 'code', redirect_uri: SPOTIFY_REDIRECT, code_challenge_method: 'S256', code_challenge: challenge, state, scope: 'streaming user-read-email user-read-private user-modify-playback-state' });
  location.assign(`https://accounts.spotify.com/authorize?${query}`);
}
async function tokenRequest(params: URLSearchParams, previousRefresh = '') {
  const epoch = generation;
  const response = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Spotifyの認証が期限切れ、または設定が一致していません。もう一度ログインしてください。');
  const data = await response.json();
  if (epoch !== generation) throw new Error('接続は解除されました。');
  if (typeof data.access_token !== 'string' || typeof data.expires_in !== 'number' || !(data.refresh_token || previousRefresh)) throw new Error('Spotifyの認証情報を取得できませんでした。');
  const tokens: Tokens = { access: data.access_token, refresh: data.refresh_token || previousRefresh, expires: Date.now() + data.expires_in * 1000 };
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(tokens));
  return tokens.access;
}
let callback: Promise<void> | null = null;
export function finishSpotifyLogin() {
  if (callback) return callback;
  callback = (async () => {
    const params = new URLSearchParams(location.search);
    const raw = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    // Remove authorization codes from the address bar before rendering other content.
    history.replaceState(null, '', location.pathname);
    const pending = raw ? JSON.parse(raw) : null;
    if (!validPending(pending, params.get('state'))) throw new Error('ログインの確認情報が一致しません。元のタブから、もう一度ログインしてください。');
    if (params.has('error')) throw new Error('Spotifyへの接続は許可されませんでした。');
    const code = params.get('code');
    if (!code) throw new Error('ログイン情報がありません。');
    await tokenRequest(new URLSearchParams({ client_id: SPOTIFY_CLIENT_ID, grant_type: 'authorization_code', code, redirect_uri: SPOTIFY_REDIRECT, code_verifier: pending.verifier }));
  })();
  return callback;
}
export async function spotifyToken(): Promise<string> {
  let tokens: Tokens | null = null;
  try { tokens = JSON.parse(sessionStorage.getItem(AUTH_KEY) || 'null'); } catch { /* Reauthenticate below. */ }
  if (!tokens?.refresh) throw new Error('Spotifyにログインしてください。');
  if (tokens.expires > Date.now() + 60_000) return tokens.access;
  if (!refreshing) refreshing = tokenRequest(new URLSearchParams({ client_id: SPOTIFY_CLIENT_ID, grant_type: 'refresh_token', refresh_token: tokens.refresh }), tokens.refresh).finally(() => { refreshing = null; });
  return refreshing;
}
export async function spotifyApi(path: string, options: RequestInit = {}) {
  const token = await spotifyToken();
  const response = await fetch(`https://api.spotify.com/v1/${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
  if (response.status === 401) throw new Error('認証が期限切れです。一度接続を解除してログインし直してください。');
  if (response.status === 403) throw new Error('Spotifyでこの操作が許可されていません。Premiumとアプリの利用ユーザー登録・利用制限をご確認ください。');
  if (response.status === 429) throw new Error('検索・操作の回数が多いため、少し待ってお試しください。');
  if (!response.ok) throw new Error('Spotifyに接続できませんでした。プレーヤーの接続状態と通信をご確認ください。');
  return response.status === 204 ? null : response.json();
}
