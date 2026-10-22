"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main id="main" className="error-page"><h1>画面を読み込めませんでした</h1><p>通信状態を確認して、もう一度お試しください。</p><button className="station-link" onClick={reset}>再試行</button><a className="station-link" href="/">ホームに戻る</a></main>;
}
