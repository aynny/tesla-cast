'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { finishSpotifyLogin } from '@/lib/spotify-auth';
export default function SpotifyCallback() {
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void finishSpotifyLogin().then(() => { if (active) location.replace('/spotify'); }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'ログインできませんでした。'); });
    return () => { active = false; };
  }, []);
  return <main className="youtube-main"><h1>Spotifyへの接続</h1><p role={error ? 'alert' : 'status'}>{error || 'ログインを確認しています…'}</p><Link className="station-link" href="/spotify">Spotifyページへ戻る</Link></main>;
}
