import Link from "next/link";
import { ArrowLeft, MapPin, CircleParking, Radio } from "lucide-react";

export function Header({ tv = false }: { tv?: boolean }) {
  return <header className="header">
    <Link href="/" className="wordmark" aria-label="TESLA Cast ホーム"><span className="brand-symbol"><Radio size={24} aria-hidden="true" /></span><span>TESLA <b>Cast</b></span></Link>
    <div className="header-right">{tv && <Link className="back" href="/"><ArrowLeft size={18} aria-hidden="true" />ホーム</Link>}<span className="region"><MapPin size={15} aria-hidden="true" /> KANSAI EDITION</span></div>
  </header>;
}
export function Footer() {
  return <footer className="footer"><div><CircleParking size={18} aria-hidden="true" /><span>車載画面での動画は駐車中に</span></div><span>非公式・個人向けプロトタイプ <span className="footer-separator">/</span> Tesla, Inc.とは無関係です</span></footer>;
}
export function UsageNote() {
  return <details className="usage"><summary>ご利用について</summary><div className="usage-body">
    <p>助手席の方は、ご自身のスマートフォン・タブレットで利用できます。サービスによっては公式アプリが開くか、アプリの利用が必要です。各サービスの対応環境に従ってください。</p>
    <p>YouTubeはサイト内の公式プレーヤーで視聴できます。その他の外部サービスは同じタブで開きます。ブラウザの「戻る」でこのアプリへ戻れます。外部サービスのログインや画面遷移によっては、複数回の戻る操作やTESLA CastのURLの再入力が必要です。</p>
    <p>Teslaの車種・年式・ソフトウェアにより、サイト表示やDRMを使う動画・音楽の再生に対応しない場合があります。実車での動作は未検証です。走行中の再生制限は回避しません。</p>
    <p>各サービスのアカウント・契約・利用料金・対応地域などの条件が適用されます。外部サイトの障害や通信エラーはこのアプリでは検知できません。接続できない場合は通信状態を確認して再度お試しください。</p>
  </div></details>;
}
