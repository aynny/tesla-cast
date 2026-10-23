export function playerError(code: number): string {
  return ({ 2: '動画IDまたは再生パラメータが無効です。', 5: 'HTML5プレーヤーで再生できません。ブラウザや動画形式の対応をご確認ください。', 100: '動画が削除されたか、非公開になっています。', 101: '投稿者が外部サイトでの再生を許可していません。', 150: '投稿者が外部サイトでの再生を許可していません。', 153: 'YouTubeがサイトの識別情報を確認できませんでした。リファラー設定やブラウザの制限が考えられます。' } as Record<number, string>)[code] || `再生エラー（${code}）。原因を特定できませんでした。`;
}
export function playerState(code: number): string {
  return ({ '-1': '再生待ち', 0: '再生終了', 1: '再生中', 2: '一時停止', 3: '読み込み中', 5: '再生準備完了' } as Record<number, string>)[code] || '状態不明';
}
export function clampPosition(x: number, y: number, width: number, height: number, viewportWidth: number, viewportHeight: number) {
  return { x: Math.max(0, Math.min(x, Math.max(0, viewportWidth - width))), y: Math.max(0, Math.min(y, Math.max(0, viewportHeight - height))) };
}
export type YoutubeInstance = { destroy(): void; pauseVideo(): void; getIframe(): HTMLIFrameElement };
type Event = { data: number; target: YoutubeInstance };
type API = { Player: new (element: HTMLElement, options: { videoId: string; width: string; height: string; playerVars: Record<string, string | number>; events: { onReady: (event: Event) => void; onStateChange: (event: Event) => void; onError: (event: Event) => void; onAutoplayBlocked: () => void } }) => YoutubeInstance };
declare global { interface Window { YT?: API; onYouTubeIframeAPIReady?: () => void } }
let loading: Promise<API> | undefined;
export function loadYoutubeApi(): Promise<API> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (loading) return loading;
  loading = new Promise<API>((resolve, reject) => {
    const script = document.createElement('script');
    const previous = window.onYouTubeIframeAPIReady;
    const finish = () => { clearTimeout(timer); script.onerror = null; if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previous; };
    const fail = () => { finish(); script.remove(); reject(new Error('YouTube APIに接続できませんでした。通信・コンテンツブロック設定をご確認ください。')); };
    const ready = () => { finish(); if (window.YT?.Player) resolve(window.YT); else reject(new Error('YouTube APIを初期化できませんでした。')); previous?.(); };
    const timer = setTimeout(fail, 15000);
    window.onYouTubeIframeAPIReady = ready;
    script.src = 'https://www.youtube.com/iframe_api'; script.async = true; script.onerror = fail;
    document.head.appendChild(script);
  }).catch(error => { loading = undefined; throw error; });
  return loading;
}
