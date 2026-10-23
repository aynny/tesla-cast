'use client';

import { useState, type FormEvent } from 'react';
import { AudioLines, ExternalLink, X } from 'lucide-react';
import { spotifyContent } from '@/lib/spotify';

export function SpotifyPlayer() {
  const [input, setInput] = useState('');
  const [content, setContent] = useState<ReturnType<typeof spotifyContent>>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  function open(event: FormEvent) {
    event.preventDefault();
    const parsed = spotifyContent(input);
    if (!parsed) { setError('Spotifyの「共有 → リンクをコピー」で取得した、open.spotify.comから始まる曲・アルバム・プレイリスト・アーティスト・番組・エピソードのURLを入力してください。短縮リンクの場合は、公式サイトで開いた後のURLを使ってください。'); return; }
    setContent(parsed); setError(''); setRevision(value => value + 1);
  }
  return <section className="youtube-watch" aria-label="Spotifyプレーヤー">
    <form onSubmit={open} className="youtube-form">
      <label htmlFor="spotify-url">Spotifyの共有URL</label>
      <div className="youtube-input-row"><input id="spotify-url" value={input} onChange={event => { setInput(event.target.value); setError(''); }} placeholder="https://open.spotify.com/playlist/…" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} required aria-invalid={!!error} aria-describedby={error ? 'spotify-error' : 'spotify-help'} /><button type="submit" className="station-link"><AudioLines size={18} aria-hidden="true" />プレーヤーを開く</button></div>
      <p id="spotify-help">Spotifyで「共有 → リンクをコピー」を選び、ここに貼り付けてください。</p>
      {error && <p id="spotify-error" role="alert" className="youtube-error">{error}</p>}
    </form>
    {content ? <div className="spotify-player-area">
      <p role="status">Spotify公式プレーヤーの再生ボタンを押してください。</p>
      <iframe key={revision} src={content.embed} title="Spotify公式プレーヤー" width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      <div className="youtube-controls"><a className="station-link" href={content.official}><ExternalLink size={18} aria-hidden="true" />Spotifyで開く</a><button className="station-link" type="button" onClick={() => setContent(null)}><X size={18} aria-hidden="true" />閉じる</button></div>
    </div> : <div className="spotify-placeholder"><AudioLines size={40} aria-hidden="true" /><h2>好きな音楽を、この画面で。</h2><p>共有URLを入力すると、公式プレーヤーを表示します。</p><a className="station-link" href="https://open.spotify.com/">Spotify公式サイトで探す</a></div>}
    <div className="youtube-notes"><p>再生できる範囲はSpotifyのログイン状態・契約・ブラウザによって異なります。試聴のみになる場合があります。歌詞表示とサイト内の曲名検索には対応していません。</p><p>プレーヤーを開くとSpotifyに接続します。再生できない場合は「Spotifyで開く」をご利用ください。Tesla実車での再生は未検証です。</p></div>
  </section>;
}
