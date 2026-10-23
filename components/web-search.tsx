'use client';
import { useEffect, useRef, useState } from 'react';
import type { WebResult } from '@/lib/tavily';
export function WebSearch() {
  const pages = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const [results, setResults] = useState<WebResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState<WebResult | null>(null);
  const viewer = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    if (viewing && viewer.current && !viewer.current.open) viewer.current.showModal();
  }, [viewing]);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    if (pages) return;
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    void fetch('/api/tavily/search?config=1', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error();
      const config = await response.json(); if (active) setEnabled(config.enabled === true);
    }).catch(() => { if (active) { setEnabled(false); setError('検索の接続状態を確認できませんでした。ページを再読み込みしてください。'); } }).finally(() => clearTimeout(timer));
    return () => { active = false; controller.abort(); pending.current?.abort(); };
  }, [pages]);
  async function search() {
    if (!enabled) return;
    const term = query.trim();
    if (!term) return;
    pending.current?.abort();
    const controller = new AbortController(); pending.current = controller;
    setBusy(true); setError('');
    setResults([]); setSearched('');
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`/api/tavily/search?${new URLSearchParams({ q: term })}`, { signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '検索できませんでした。');
      if (pending.current !== controller) return;
      setResults(data.results); setSearched(term);
    } catch (e) { if (pending.current === controller) setError(controller.signal.aborted ? '検索がタイムアウトしました。' : e instanceof Error ? e.message : '検索できませんでした。'); }
    finally { clearTimeout(timer); if (pending.current === controller) setBusy(false); }
  }
  if (pages) return <a className="station-link" href="https://tesla-cast.vercel.app/search">Tavily検索ページを開く</a>;
  return <section aria-label="Tavily Web検索">
    <form className="youtube-form" role="search" onSubmit={event => { event.preventDefault(); void search(); }}><label htmlFor="web-query">Webを検索</label><div className="youtube-input-row"><input id="web-query" value={query} onChange={e => setQuery(e.target.value)} maxLength={200} required placeholder="調べたいキーワード" enterKeyHint="search" /><button className="station-link" disabled={!enabled || busy}>検索</button></div></form>
    {enabled === null && <p role="status">検索の接続状態を確認中…</p>}
    {enabled === false && <p className="search-setup">サイト内検索は準備中です。Tavily APIの設定後に利用できます。</p>}
    {error && <p className="youtube-error" role="alert">{error}</p>}
    <p role="status">{busy ? '検索中…' : searched ? `「${searched}」の検索結果：${results.length}件` : ''}</p>
    <ol className="web-results">{results.map(result => <li key={result.url}><span>{result.hostname}</span><h2><a href={result.url} rel="noreferrer" onClick={event => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); setViewing(result); }}>{result.title}</a></h2><p>{result.description}</p></li>)}</ol>
    <dialog ref={viewer} className="web-viewer" onClose={() => setViewing(null)} aria-labelledby="viewer-title">
      {viewing && <>
        <div className="web-viewer-toolbar"><button autoFocus className="station-link" onClick={() => viewer.current?.close()}>検索結果に戻る</button><div><h2 id="viewer-title">{viewing.title}</h2><p>開いたリンク：{viewing.hostname}</p></div><a className="station-link" href={viewing.url} rel="noreferrer">公式サイトを開く</a></div>
        <p className="web-viewer-notice">外部サイトを表示しています。白い画面や接続拒否が出る場合、サイト側の埋め込み制限などにより表示できません。「公式サイトを開く」をご利用ください。</p>
        {viewing.url.startsWith('https:') && new URL(viewing.url).origin !== window.location.origin
          ? <iframe key={viewing.url} src={viewing.url} title={`${viewing.title}（外部サイト）`} sandbox="allow-scripts allow-same-origin allow-forms" referrerPolicy="no-referrer" />
          : <p className="web-viewer-notice">このリンクはサイト内表示に対応していません。公式サイトを開いてください。</p>}
      </>}
    </dialog>
    <div className="youtube-notes"><p>検索結果はTavilyが提供します。検索語はTavilyへ送信されます。検索結果を選ぶとサイト内の閲覧画面で開きます。埋め込みに対応しないサイトは「公式サイトを開く」で移動できます。</p><a href="https://www.tavily.com/">検索提供元：Tavily</a></div>
  </section>;
}
