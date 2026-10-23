'use client';
import { useEffect, useState } from 'react';
import { loadYoutubeApi } from '@/lib/youtube-player-api';
import { YoutubeSurface } from '@/components/youtube-surface';
export function PlaybackDiagnostics() {
  const [details, setDetails] = useState<Record<string,string>>({});
  const [api, setApi] = useState('未確認');
  const [testing, setTesting] = useState(false);
  const [video, setVideo] = useState(false);
  useEffect(() => {
    const update = () => setDetails({ 'ブラウザ': navigator.userAgent, 'HTTPS': window.isSecureContext ? '有効' : '無効', 'ネットワーク接続の申告値': navigator.onLine ? 'オンライン（通信成功の保証ではありません）' : 'オフライン', '画面サイズ': `${innerWidth} × ${innerHeight}`, 'タッチ入力': navigator.maxTouchPoints > 0 ? '対応' : '未検出', '画面の表示状態': document.visibilityState, '動画機能': !!document.createElement('video').canPlayType('video/mp4') ? 'MP4対応の申告あり（実再生は別途確認）' : 'MP4対応を確認できません', 'DRM用API': 'requestMediaKeySystemAccess' in navigator ? 'あり（DRM再生対応の保証ではありません）' : '未検出', '車両の走行・駐車状態': 'Webからは取得していません' });
    update(); window.addEventListener('resize',update); window.addEventListener('online',update); window.addEventListener('offline',update); document.addEventListener('visibilitychange',update);
    return () => { window.removeEventListener('resize',update); window.removeEventListener('online',update); window.removeEventListener('offline',update); document.removeEventListener('visibilitychange',update); };
  }, []);
  async function testApi() {
    setTesting(true); setApi('接続確認中…');
    try { await loadYoutubeApi(); setApi('API読込成功（動画再生は別途確認）'); } catch (e) { setApi(e instanceof Error ? e.message : '接続に失敗しました'); } finally { setTesting(false); }
  }
  return <section className="diagnostics"><p>結果はこの画面だけに表示し、保存・送信しません。接続テストや動画表示を押すとYouTubeへ接続します。</p><dl>{Object.entries(details).map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <button className="station-link" disabled={testing} onClick={() => void testApi()}>YouTube API接続テスト</button><p role="status">{api}</p>
    <button className="station-link" onClick={() => setVideo(true)}>駐車中のテスト動画を表示</button>
    {video && <YoutubeSurface videoId="M7lc1UVf-VE" title="YouTube API公式サンプル" onClose={() => setVideo(false)} />}
    <h2>実車での確認手順</h2><ol><li>車を安全な場所に駐車し、車種・年式・ソフトウェア版を記録します。</li><li>接続テスト後、動画の再生ボタンを押して映像・音声・状態表示を確認します。</li><li>小窓への切替、移動、サイズ変更、最小化による一時停止、復元を確認します。</li><li>動画を閉じたときとページ移動時に音声が止まることを確認します。</li><li>再生できない場合は表示されたエラー番号とブラウザ情報を記録します。</li></ol><p>実車での駐車中再生は未検証です。走行中の映像表示制限、DRM、地域制限は回避しません。</p>
  </section>;
}
