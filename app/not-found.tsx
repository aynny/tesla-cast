import Link from "next/link";
export default function NotFound() {
  return <main id="main" className="error-page"><span className="section-kicker">404 / TESLA Cast</span><h1>ページが見つかりません</h1><p>ホームからメディアを選び直してください。</p><Link className="station-link" href="/">ホームに戻る</Link></main>;
}
