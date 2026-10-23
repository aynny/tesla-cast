import { Header, Footer } from '@/components/shell';
import { PlaybackDiagnostics } from '@/components/playback-diagnostics';
export const metadata = { title: '再生診断 | TESLA Cast' };
export default function DiagnosticsPage() {
  return <div className="app-shell"><Header tv /><main id="main" className="youtube-main"><h1>再生診断</h1><p>駐車中の車載ブラウザで、接続と再生を確認できます。</p><PlaybackDiagnostics /></main><Footer /></div>;
}
