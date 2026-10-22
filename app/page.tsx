import { Header, Footer, UsageNote } from "@/components/shell";
import { MediaCards } from "@/components/media-card";
import { DeviceLink } from "@/components/device-link";
export default function Home() {
  return <div className="app-shell"><Header /><main id="main" className="home-main">
    <div className="hero"><div className="section-kicker"><span /> YOUR ENTERTAINMENT, WITH YOU</div><h1>Your entertainment.<br /><span>One screen.</span></h1><p>助手席のスマホでも、駐車中の車内でも。</p></div>
    <div className="section-label"><span>メディアを選ぶ</span><span>SELECT YOUR NEXT MOMENT</span></div><MediaCards />
    <div className="below-cards"><p>YouTubeはサイト内で再生。その他のメディアは公式サービスへ。</p><UsageNote /></div>
    <DeviceLink />
  </main><Footer /></div>;
}
