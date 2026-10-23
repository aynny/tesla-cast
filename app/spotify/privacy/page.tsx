import Link from 'next/link';
export default function SpotifyPrivacy() {
  return <main className="youtube-main"><h1>Spotifyの接続とデータ</h1><div className="youtube-notes">
    <p>TESLA Castは個人向けの非公式プレーヤーです。SpotifyのパスワードはSpotify公式画面に入力し、このサイトでは取得しません。</p>
    <p>再生に必要な認証、アカウント情報に関する権限と再生操作の権限を要求します。検索語はSpotifyに送信され、選択した曲の再生情報を表示します。メールアドレスやプロフィールを独自に取得・保存する処理はありません。</p>
    <p>認証トークンはこのタブのsessionStorageに保存し、Spotifyへの通信に使用します。通常はタブを閉じると削除されますが、ブラウザの復元機能で残る場合があります。共有端末では「接続を解除」を押してください。アプリのサーバーにはトークン、検索履歴、再生履歴を保存しません。ホスティングサービスは運用上のアクセスログを記録する場合があります。</p>
    <p>「接続を解除」はこのタブの認証情報と表示データを削除し、プレーヤーを切断します。Spotify側での許可も取り消す場合は、<a href="https://www.spotify.com/account/apps/">Spotifyのアプリ管理</a>でTESLA Castのアクセス権を削除してください。</p>
    <p>Spotify側のデータ処理には<a href="https://www.spotify.com/legal/privacy-policy/">Spotifyのプライバシーポリシー</a>が適用されます。</p>
  </div><Link className="station-link" href="/spotify">戻る</Link></main>;
}
