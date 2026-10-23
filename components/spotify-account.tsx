'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { disconnectSpotify, hasSpotifySession, loginSpotify, spotifyApi, spotifyToken } from '@/lib/spotify-auth';
import { loadSpotifySdk, type Player, type Playback } from '@/lib/spotify-sdk';
type Track = { id: string; name: string; artists: { name: string }[] };
export function SpotifyAccount() {
  const [signedIn, setSignedIn] = useState(false);
  const [device, setDevice] = useState('');
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const player = useRef<Player | null>(null);
  const generation = useRef(0);
  useEffect(() => { setSignedIn(hasSpotifySession()); }, []);
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    let instance: Player | null = null;
    setMessage('Spotifyプレーヤーに接続中…');
    void loadSpotifySdk().then(async sdk => {
      if (cancelled) return;
      instance = new sdk.Player({ name: 'TESLA Cast', volume: 0.5, getOAuthToken: cb => { void spotifyToken().then(token => { if (!cancelled) cb(token); }).catch(() => { if (!cancelled) setError('認証できません。接続を解除して再ログインしてください。'); }); } });
      player.current = instance;
      instance.addListener('ready', ({ device_id }) => { if (!cancelled) { setDevice(device_id); setMessage('接続できました。曲を検索して選んでください。'); } });
      instance.addListener('not_ready', () => { if (!cancelled) { setDevice(''); setMessage('プレーヤーがオフラインです。通信を確認してページを再読み込みしてください。'); } });
      instance.addListener('player_state_changed', state => { if (!cancelled) setPlayback(state); });
      const errors = {
        initialization_error: 'このブラウザではSpotifyの保護された音声を再生できません。Spotify公式サイトまたはアプリをご利用ください。',
        authentication_error: 'Spotifyの認証に失敗しました。接続を解除して再ログインしてください。',
        account_error: '有効なSpotify Premiumアカウントが必要です。',
        playback_error: 'Spotifyが曲を再生できませんでした。別の曲でお試しください。',
        autoplay_failed: '再生ボタンをもう一度押してください。',
      };
      for (const [event, text] of Object.entries(errors)) instance.addListener(event as keyof typeof errors, () => { if (!cancelled) setError(text); });
      const connected = await instance.connect();
      if (!connected && !cancelled) setError('プレーヤーに接続できませんでした。Spotify公式サイトをお試しください。');
    }).catch(() => { if (!cancelled) setError('Spotifyのプレーヤーを読み込めませんでした。通信を確認し、ページを再読み込みしてください。'); });
    return () => { cancelled = true; instance?.disconnect(); player.current = null; };
  }, [signedIn]);
  async function action(fn: () => Promise<void>) {
    const epoch = generation.current;
    setError(''); setBusy(true);
    try { await fn(); } catch (e) { if (epoch === generation.current) setError(e instanceof Error ? e.message : '操作できませんでした。'); }
    finally { if (epoch === generation.current) setBusy(false); }
  }
  function logout() {
    generation.current++; player.current?.disconnect(); disconnectSpotify(); setSignedIn(false); setDevice(''); setPlayback(null); setTracks([]); setQuery(''); setBusy(false); setMessage('接続を解除しました。'); setError('');
  }
  async function search(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    const epoch = generation.current;
    await action(async () => {
      const data = await spotifyApi(`search?${new URLSearchParams({ q: query.trim(), type: 'track', limit: '10' })}`);
      if (epoch !== generation.current) return;
      const found = (data.tracks?.items || []).filter((t: Track | null) => t && /^[A-Za-z0-9]{22}$/.test(t.id) && typeof t.name === 'string' && Array.isArray(t.artists));
      setTracks(found); setMessage(found.length ? `${found.length}件の曲が見つかりました。` : '曲が見つかりませんでした。');
    });
  }
  if (process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true') return <section className="spotify-account"><a className="station-link" href="https://tesla-cast.vercel.app/spotify">ログインして聴ける版を開く</a></section>;
  return <section className="spotify-account" aria-label="Spotifyアカウントで再生">
    <h2>Spotifyにログインして聴く</h2>
    <p>Premium（Studentを含む）向け。認証はSpotify公式画面で行います。Teslaでの再生は未検証です。</p>
    {!signedIn ? <button className="station-link" disabled={busy} onClick={() => void action(loginSpotify)}>Spotifyにログイン</button> : <>
      <div className="youtube-controls"><span>Spotifyに接続済み</span><button className="station-link" onClick={logout}>接続を解除</button></div>
      <form className="youtube-form" onSubmit={search}><label htmlFor="spotify-search">曲名・アーティストで検索</label><div className="youtube-input-row"><input id="spotify-search" value={query} onChange={event => setQuery(event.target.value)} maxLength={100} required enterKeyHint="search" /><button className="station-link" disabled={busy}>検索</button></div></form>
      {playback && <div><h3>{playback.track_window.current_track.name}</h3><p>{playback.track_window.current_track.artists.map(a => a.name).join(' / ')}</p></div>}
      <div className="youtube-controls">
        <button className="station-link" disabled={!device || busy || !playback} onClick={() => void action(async () => { await player.current?.previousTrack(); })}>前の曲</button>
        <button className="station-link" disabled={!device || busy || !playback} onClick={() => void action(async () => { await player.current?.activateElement(); await player.current?.togglePlay(); })}>{playback && !playback.paused ? '一時停止' : '再生'}</button>
        <button className="station-link" disabled={!device || busy || !playback} onClick={() => void action(async () => { await player.current?.nextTrack(); })}>次の曲</button>
      </div>
      <ul className="spotify-tracks">{tracks.map(track => <li key={track.id}><div><strong>{track.name}</strong><p>{track.artists.map(a => a.name).join(' / ')}</p><a href={`https://open.spotify.com/track/${track.id}`}>Spotifyで開く</a></div><button className="station-link" disabled={!device || busy} onClick={() => void action(async () => { await player.current?.activateElement(); await spotifyApi(`me/player/play?device_id=${encodeURIComponent(device)}`, { method: 'PUT', body: JSON.stringify({ uris: [`spotify:track:${track.id}`] }) }); })}>この画面で再生</button></li>)}</ul>
    </>}
    <p role="status">{busy ? '処理中…' : message}</p>{error && <p className="youtube-error" role="alert">{error}</p>}
    <p><a href="https://open.spotify.com/">Spotify公式サイト</a> · <Link href="/spotify/privacy">接続とデータの扱い</Link></p>
  </section>;
}
