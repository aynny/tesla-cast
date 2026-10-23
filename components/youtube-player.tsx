"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Play, Search, X } from 'lucide-react';
import { youtubeVideoId } from '@/lib/youtube';
import type { SearchResults, SearchVideo } from '@/lib/youtube-search';

export function YouTubePlayer({ searchEnabled }: { searchEnabled: boolean }) {
  const pages = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [videos, setVideos] = useState<SearchVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [input, setInput] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const pending = useRef<AbortController | null>(null);
  const playerArea = useRef<HTMLDivElement>(null);
  useEffect(() => () => pending.current?.abort(), []);

  async function search(more = false) {
    const term = more ? searchedQuery : query.trim();
    if (!term || term.length > 100) { setSearchError('検索キーワードを1〜100文字で入力してください。'); return; }
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true); setSearchError('');
    if (!more) { setVideos([]); setNextPageToken(undefined); setSearched(false); }
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      const params = new URLSearchParams({ q: term });
      if (more && nextPageToken) params.set('pageToken', nextPageToken);
      const response = await fetch(`/api/youtube/search?${params}`, { signal: controller.signal });
      const data: SearchResults & { message?: string } = await response.json();
      if (!response.ok) throw new Error(data.message || '検索できませんでした。もう一度お試しください。');
      if (pending.current !== controller) return;
      setVideos(previous => more ? [...previous, ...data.videos.filter(video => !previous.some(item => item.id === video.id))] : data.videos);
      setNextPageToken(data.nextPageToken);
      setSearchedQuery(term); setSearched(true);
    } catch (cause) {
      if (pending.current === controller) setSearchError(controller.signal.aborted ? '検索がタイムアウトしました。もう一度お試しください。' : cause instanceof Error ? cause.message : '検索できませんでした。');
    } finally {
      clearTimeout(timer);
      if (pending.current === controller) setBusy(false);
    }
  }

  function selectVideo(id: string, name = 'YouTube動画') {
    setVideoId(id); setTitle(name); setError(''); setRevision(value => value + 1);
    playerArea.current?.focus();
    playerArea.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  function loadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = youtubeVideoId(input);
    if (!id) { setError('YouTubeの動画URLを入力してください。共有リンク・Shorts・ライブにも対応しています。'); return; }
    selectVideo(id);
  }

  return <section className="youtube-watch" aria-label="YouTube視聴">
    {pages ? <div className="youtube-form"><h2>動画URLから、この画面で再生</h2><p>キーワードで探す場合は、検索対応版を開いてください。このページでは動画URLから再生できます。</p><a className="station-link" href="https://tesla-cast.vercel.app/youtube">検索対応版を開く</a></div> : <form onSubmit={event => { event.preventDefault(); void search(); }} className="youtube-form" role="search" aria-label="YouTube動画検索">
      <label htmlFor="youtube-search">YouTubeで動画を探す</label>
      <div className="youtube-input-row"><input id="youtube-search" value={query} onChange={event => setQuery(event.target.value)} maxLength={100} placeholder="動画名、アーティスト、気になるキーワード" enterKeyHint="search" aria-describedby="search-help" />
        <button type="submit" className="station-link" disabled={busy || !searchEnabled}><Search size={18} aria-hidden="true" />{busy ? '検索中…' : '検索'}</button></div>
      <p id="search-help">検索して、サムネイルをタップ。そのままこの画面で再生できます。</p>
      {!searchEnabled && <p className="search-setup" role="status">検索は準備中です。サイト管理者によるYouTube連携の設定後に利用できます。</p>}
      {searchError && <p role="alert" className="youtube-error">{searchError}</p>}
    </form>}

    <div ref={playerArea} tabIndex={-1} className="youtube-player-area" aria-label="動画プレーヤー">
      {videoId && <h2 className="playing-title">{title}</h2>}
      <div className="youtube-frame">
        {videoId ? <iframe key={`${videoId}-${revision}`} src={`https://www.youtube.com/embed/${videoId}?playsinline=1&autoplay=0`} title={`YouTube公式プレーヤー：${title}`} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> :
          <div className="youtube-empty"><Play size={40} aria-hidden="true" /><h2>{pages ? "好きな動画を、この画面で。" : "見つけて、タップして、楽しもう。"}</h2><p>{pages ? "下の欄に動画URLを入力すると、ここに表示されます。" : "検索結果から動画を選ぶと、ここに表示されます。"}</p></div>}
      </div>
      {videoId && <div className="youtube-controls"><p role="status">プレーヤー内の再生ボタンを押してください。</p><button type="button" className="station-link" onClick={() => { setVideoId(null); setError(''); }}><X size={18} aria-hidden="true" />動画を閉じる</button></div>}
    </div>

    <section className="youtube-results" aria-label="YouTube検索結果" aria-busy={busy}>
      <p role="status" className="search-status">{busy ? 'YouTubeで検索しています…' : searched ? videos.length ? `「${searchedQuery}」の検索結果 · ${videos.length}件` : '動画が見つかりませんでした。別のキーワードでお試しください。' : ''}</p>
      <div className="video-results-grid">{videos.map(video => <button type="button" className={`video-result ${videoId === video.id ? 'selected' : ''}`} key={video.id} onClick={() => selectVideo(video.id, video.title)} aria-label={`${video.title} — ${video.channel} を再生`} aria-pressed={videoId === video.id}>
        <img src={video.thumbnail} alt="" width={320} height={180} loading="lazy" referrerPolicy="no-referrer" />
        <span className="result-copy"><strong>{video.title}</strong><span>{video.channel}</span><span className="result-action"><Play size={14} aria-hidden="true" />{videoId === video.id ? '選択中' : 'この画面で再生'}</span></span>
      </button>)}</div>
      {nextPageToken && <button type="button" className="station-link load-more" disabled={busy} onClick={() => void search(true)}>もっと見る</button>}
    </section>

    <details className="usage youtube-url-option" open={pages ? true : undefined}><summary>動画URLから開く</summary><form onSubmit={loadVideo} className="youtube-form"><label htmlFor="youtube-url">YouTubeの動画URL</label><div className="youtube-input-row"><input id="youtube-url" value={input} onChange={event => { setInput(event.target.value); setError(''); }} placeholder="https://youtu.be/…" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="url" aria-invalid={!!error} /><button type="submit" className="station-link">動画を開く</button></div>{error && <p role="alert" className="youtube-error">{error}</p>}</form></details>
    <div className="youtube-notes"><p>{pages ? "動画を開くとYouTube公式プレーヤーに接続します。" : "検索語はYouTubeに送信されます。動画の選択後はYouTube公式プレーヤーに接続します。"}</p>
      <details className="usage"><summary>再生できないとき</summary><div className="usage-body"><p>埋め込み可能な動画を検索しますが、年齢・地域制限や投稿者の設定変更などで再生できない場合があります。プレーヤー内の案内に従うか、別の動画を選んでください。</p><p>通信状態をご確認ください。同じ動画を選び直すと読み込み直せます。車載ブラウザでの再生は未検証です。</p></div></details>
    </div>
  </section>;
}
