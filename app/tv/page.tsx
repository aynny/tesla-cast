import { ArrowUpRight, Radio, Info } from "lucide-react";
import { Header, Footer, UsageNote } from "@/components/shell";
import { stations, checkedAt, channelSource, liveLabel } from "@/lib/stations";
export const metadata = { title: "関西の地上波テレビ | TESLA Cast" };
export default function TVPage() {
  return <div className="app-shell"><Header tv /><main id="main" className="tv-main">
    <div className="tv-heading"><div><div className="section-kicker"><span /> KANSAI CHANNEL GUIDE</div><h1>関西の地上波テレビ<span className="count">12局</span></h1><p>なじみの放送局から、公式の配信サービスへ。</p></div><Radio size={38} strokeWidth={1} aria-hidden="true" /></div>
    <div className="info-note"><Info size={19} aria-hidden="true" /><p>テレビ放送を直接受信する機能ではありません。リアルタイム配信は対象番組・時間帯のみ。系列局の配信は関西の放送内容と異なる場合があります。</p></div>
    <div className="station-section-label"><span>放送局一覧</span><span>公式情報確認日：{checkedAt} · 現在の配信中表示ではありません</span></div>
    <section className="station-grid" aria-label="関西の放送局">{stations.map(s => <article className="station-card" key={s.id}>
      <div className="station-top"><span className="station-mark" aria-hidden="true">{s.mark}</span><span className="channel">{s.channel}<small>ch</small></span></div>
      <div className="station-title"><h2>{s.name}</h2><span>{s.area} · 標準リモコン番号</span></div>
      <div className={`status ${s.live === "unknown" ? "unknown" : "available"}`}><span />{liveLabel(s.live)}</div>
      {s.replayUrl && <span className="replay-label">見逃し配信あり（対象番組）</span>}
      <p className="station-note">{s.note}</p>
      <div className="station-actions">{s.liveUrl && <a className="station-link" href={s.liveUrl}>{s.live === "nhk" ? "NHK ONEの利用案内" : "TVerの配信予定を見る"}<ArrowUpRight size={17} aria-hidden="true" /></a>}
      {s.replayUrl && <a className="station-link" href={s.replayUrl}>見逃し配信の公式案内<ArrowUpRight size={17} aria-hidden="true" /></a>}
      {!s.liveUrl && !s.replayUrl && <span className="unavailable">視聴リンク未掲載</span>}
      {s.source && <a className="source-link" href={s.source}>確認元の公式情報<ArrowUpRight size={13} aria-hidden="true" /></a>}</div>
    </article>)}</section>
    <div className="tv-notes"><p>番号は地上デジタル放送の標準リモコン番号です（物理チャンネルではありません）。NHK総合は各府県の地域放送となり、大阪以外はNHK大阪とは番組が異なります。隣接地域・ケーブルテレビ・受信機の設定によって番号や受信範囲が変わります。</p><a href={channelSource}>地域別チャンネル表（メーカー公式PDF）<ArrowUpRight size={14} aria-hidden="true" /></a><p>「未確認」は配信がないという意味ではありません。NHK ONEはサービス側でアカウント登録・受信契約等の利用条件をご確認ください。</p><UsageNote /></div>
  </main><Footer /></div>;
}
