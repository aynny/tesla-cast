import Link from "next/link";
import { ArrowRight, Globe, Play, AudioLines } from "lucide-react";

const media = [
  { id: "youtube", name: "YouTube", category: "VIDEOS & CREATORS", description: "好きな動画を、好きなだけ。", href: "/youtube" },
  { id: "spotify", name: "Spotify", category: "MUSIC & PODCASTS", description: "この時間に、ぴったりの音を。", href: "/spotify" },
  { id: "web", name: "Web", category: "SEARCH & DISCOVER", description: "気になることを、この画面で。", href: "/search" },
];
export function MediaCards() {
  return <nav className="media-grid" aria-label="メディアを選ぶ">{media.map((item, i) => {
    const content = <><div className="card-top"><span>0{i + 1}</span><ArrowRight size={20} aria-hidden="true" /></div>
      <div className={`media-logo ${item.id}`} aria-hidden="true">
        {item.id === "youtube" && <span className="youtube-icon"><Play fill="currentColor" strokeWidth={0} size={33} /></span>}
        {item.id === "spotify" && <span className="spotify-icon"><AudioLines size={40} strokeWidth={2.1} /></span>}
        {item.id === "web" && <Globe size={53} strokeWidth={1.5} />}
      </div><div className="card-copy"><span className="eyebrow">{item.category}</span><h2>{item.name}</h2><p>{item.description}</p></div><div className="card-bottom"><span>{item.id === "youtube" ? "サイト内で動画を見る" : item.id === "spotify" ? "サイト内で音楽を聴く" : "Webを検索する"}</span><ArrowRight size={16} aria-hidden="true" /></div></>;
    return item.href.startsWith("/") ? <Link key={item.id} href={item.href} className="media-card">{content}</Link> : <a key={item.id} href={item.href} className="media-card">{content}</a>;
  })}</nav>;
}
