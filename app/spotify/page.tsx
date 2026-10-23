import { Header, Footer } from '@/components/shell';
import { SpotifyPlayer } from '@/components/spotify-player';
import { SpotifyAccount } from '@/components/spotify-account';
export const metadata = { title: 'Spotifyを聴く | TESLA Cast' };
export default function SpotifyPage() {
  return <div className="app-shell"><Header tv /><main id="main" className="youtube-main">
    <div className="section-kicker"><span /> MUSIC & PODCASTS</div>
    <h1>Spotify<span>を、この画面で。</span></h1>
    <p className="youtube-intro">曲、プレイリスト、ポッドキャストを公式プレーヤーで。</p>
    <SpotifyAccount /><details className="usage"><summary>共有URLから公式プレーヤーを開く</summary><SpotifyPlayer /></details>
  </main><Footer /></div>;
}
