'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { clampPosition, loadYoutubeApi, playerError, playerState, type YoutubeInstance } from '@/lib/youtube-player-api';

export function YoutubeSurface({ videoId, title, onClose }: { videoId: string; title: string; onClose: () => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const player = useRef<YoutubeInstance | null>(null);
  const minimized = useRef(false);
  const [mini, setMini] = useState(false);
  const [floating, setFloating] = useState(false);
  const [size, setSize] = useState(480);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [status, setStatus] = useState('接続中…');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  useEffect(() => {
    let active = true;
    let instance: YoutubeInstance | undefined;
    setStatus('接続中…'); setError('');
    const timeout = setTimeout(() => { if (active) setError('プレーヤーの応答を確認できません。通信状態やブラウザの制限をご確認ください。'); }, 25000);
    void loadYoutubeApi().then(api => {
      if (!active || !mount.current) return;
      const target = document.createElement('div'); mount.current.replaceChildren(target);
      instance = new api.Player(target, { videoId, width: '100%', height: '100%', playerVars: { playsinline: 1, autoplay: 0, origin: window.location.origin }, events: {
        onReady: event => { if (!active) return; clearTimeout(timeout); setError(''); setStatus('再生準備完了。プレーヤーの再生ボタンを押してください。'); if (minimized.current) event.target.pauseVideo(); },
        onStateChange: event => { if (!active) return; if (minimized.current && event.data === 1) event.target.pauseVideo(); setStatus(playerState(event.data)); },
        onError: event => { if (active) { clearTimeout(timeout); setError(playerError(event.data)); setStatus('再生エラー'); } },
        onAutoplayBlocked: () => { if (active) setStatus('自動再生は許可されていません。プレーヤーの再生ボタンを押してください。'); },
      } });
      player.current = instance;
      instance.getIframe().title = `YouTube公式プレーヤー：${title}`;
      instance.getIframe().referrerPolicy = 'strict-origin-when-cross-origin';
    }).catch(cause => { if (active) { clearTimeout(timeout); setError(cause instanceof Error ? cause.message : 'プレーヤーに接続できませんでした。'); } });
    return () => { active = false; clearTimeout(timeout); instance?.destroy(); player.current = null; };
  }, [videoId, title, attempt]);
  function constrain(x: number, y: number) {
    const rect = panel.current?.getBoundingClientRect();
    return clampPosition(x, y, rect?.width || size, rect?.height || 400, window.innerWidth, window.innerHeight);
  }
  useEffect(() => {
    if (!floating) return;
    const fit = () => setPosition(p => constrain(p.x, p.y));
    fit(); window.addEventListener('resize', fit);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    if (panel.current) observer?.observe(panel.current);
    return () => { window.removeEventListener('resize', fit); observer?.disconnect(); };
  }, [floating, size, mini]);
  function minimize() {
    minimized.current = !mini;
    if (!mini) player.current?.pauseVideo();
    setMini(!mini);
  }
  return <div ref={panel} className={`yt-surface ${floating ? 'yt-floating' : ''}`} style={floating ? { width: size, left: position.x, top: position.y } : undefined}>
    <div className="yt-toolbar">
      <button className="station-link" aria-pressed={floating} onClick={() => setFloating(!floating)}>{floating ? '通常表示に戻す' : '駐車中の小窓表示'}</button>
      <button className="station-link" onClick={minimize}>{mini ? 'プレーヤーを表示' : '最小化・一時停止'}</button>
      <button className="station-link" onClick={onClose}>閉じる</button>
    </div>
    {floating && <div className="yt-toolbar">
      <button className="station-link yt-drag" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, left: position.x, top: position.y }; }} onPointerMove={e => { const d = drag.current; if (d) setPosition(constrain(d.left + e.clientX - d.x, d.top + e.clientY - d.y)); }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onKeyDown={e => { const delta: Record<string, number[]> = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }; if (delta[e.key]) { e.preventDefault(); const [x,y] = delta[e.key]; setPosition(constrain(position.x+x,position.y+y)); } }}>移動（ドラッグ／矢印キー）</button>
      <label>サイズ<select value={size} onChange={e => setSize(Number(e.target.value))}><option value={360}>小</option><option value={480}>中</option><option value={640}>大</option></select></label>
      <button className="station-link" onClick={() => setPosition(constrain(window.innerWidth, window.innerHeight))}>右下に配置</button>
    </div>}
    <div className="youtube-frame yt-api-frame" hidden={mini} ref={mount} />
    <p className="yt-status" role="status">{mini ? '最小化中（一時停止）。復元後、再生ボタンを押してください。' : status}</p>
    {error && <div className="youtube-error" role="alert"><p>{error}</p><button className="station-link" onClick={() => setAttempt(n => n+1)}>再読み込み</button></div>}
    <div className="yt-toolbar"><a className="station-link" href={`https://www.youtube.com/watch?v=${videoId}`}>YouTube公式サイトで開く</a><Link className="station-link" href="/diagnostics">再生診断</Link></div>
    <p className="yt-caption">車載画面では駐車中にご利用ください。ページを移動すると再生は終了します。</p>
  </div>;
}
