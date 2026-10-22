import { Header, Footer } from "@/components/shell";
import { YouTubePlayer } from "@/components/youtube-player";

export const dynamic = "force-dynamic";

export const metadata = { title: "YouTubeを観る | TESLA Cast" };

export default function YouTubePage() {
  return <div className="app-shell"><Header tv /><main id="main" className="youtube-main">
    <div className="section-kicker"><span /> VIDEOS & CREATORS</div>
    <h1>YouTube<span>を、この画面で。</span></h1>
    <p className="youtube-intro">助手席の端末で、好きな動画を。車載画面では駐車中にご利用ください。</p>
    <YouTubePlayer searchEnabled={Boolean(process.env.YOUTUBE_API_KEY?.trim())} />
  </main><Footer /></div>;
}
