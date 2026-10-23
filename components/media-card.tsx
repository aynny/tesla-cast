import Link from "next/link";
import { ArrowUpRight, ArrowRight, Tv, Play, AudioLines } from "lucide-react";

const media = [
  { id: "youtube", name: "YouTube", category: "VIDEOS & CREATORS", description: "好きな動画を、好きなだけ。", href: "/youtube" },
  { id: "netflix", name: "Netflix", category: "MOVIES & SERIES", description: "次の物語に、出会おう。", href: "https://www.netflix.com/" },
  { id: "tver", name: "TVer", category: "TV ON DEMAND", description: "見逃した番組を、ここから。", href: "https://tver.jp/" },
  { id: "tv", name: "地上波テレビ", category: "LOCAL CHANNELS", description: "いつもの関西を、この画面で。", href: "/tv" },
  { id: "spotify", name: "Spotify", category: "MUSIC & PODCASTS", description: "この時間に、ぴったりの音を。", href: "/spotify" },
];
export function MediaCards() {
  return <nav className="media-grid" aria-label="メディアを選ぶ">{media.map((item, i) => {
    const content = <><div className="card-top"><span>0{i + 1}</span>{item.href.startsWith("/") ? <ArrowRight size={20} aria-hidden="true" /> : <ArrowUpRight size={20} aria-hidden="true" />}</div>
      <div className={`media-logo ${item.id}`} aria-hidden="true">
        {item.id === "youtube" && <span className="youtube-icon"><Play fill="currentColor" strokeWidth={0} size={33} /></span>}
        {item.id === "netflix" && <span className="netflix-letter">N</span>}
        {item.id === "tver" && <span className="tver-letter">TVer<span>↗</span></span>}
        {item.id === "tv" && <Tv size={53} strokeWidth={1.5} />}
        {item.id === "spotify" && <span className="spotify-icon"><AudioLines size={40} strokeWidth={2.1} /></span>}
      </div><div className="card-copy"><span className="eyebrow">{item.category}</span><h2>{item.name}</h2><p>{item.description}</p></div><div className="card-bottom"><span>{item.id === "tv" ? "関西の放送局を見る" : item.id === "youtube" ? "サイト内で動画を見る" : item.id === "spotify" ? "サイト内で音楽を聴く" : "公式サイトを開く"}</span>{item.id === "tv" ? <span className="mini-badge">12局</span> : item.href.startsWith("/") ? <ArrowRight size={16} aria-hidden="true" /> : <ArrowUpRight size={16} aria-hidden="true" />}</div></>;
    return item.href.startsWith("/") ? <Link key={item.id} href={item.href} className="media-card">{content}</Link> : <a key={item.id} href={item.href} className="media-card">{content}</a>;
  })}</nav>;
}
