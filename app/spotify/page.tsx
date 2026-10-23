import { Header, Footer } from '@/components/shell';
import { SpotifyPlayer } from '@/components/spotify-player';
export const metadata = { title: 'Spotifyを聴く | TESLA Cast' };
export default function SpotifyPage() {
  return <div className="app-shell"><Header tv /><main id="main" className="youtube-main">
    <div className="section-kicker"><span /> MUSIC & PODCASTS</div>
    <h1>Spotify<span>を、この画面で。</span></h1>
    <p className="youtube-intro">曲、プレイリスト、ポッドキャストを公式プレーヤーで。</p>
    <SpotifyPlayer />
  </main><Footer /></div>;
}
