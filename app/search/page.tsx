import { Header, Footer } from '@/components/shell';
import { WebSearch } from '@/components/web-search';
export const metadata = { title: 'Web検索 | TESLA Cast' };
export default function SearchPage() {
  return <div className="app-shell"><Header tv /><main id="main" className="youtube-main"><div className="section-kicker"><span /> WEB SEARCH</div><h1>Web<span>で調べる。</span></h1><p className="youtube-intro">検索結果を、この画面で。</p><WebSearch /></main><Footer /></div>;
}
