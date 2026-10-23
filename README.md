# 公開先

- 検索対応版：https://tesla-cast.vercel.app/youtube
- GitHub Pages簡易版：https://aynny.github.io/tesla-cast/

検索対応版はVercelで通常のNext.jsアプリとして公開します。`YOUTUBE_API_KEY` はVercelのProduction Secretとして設定し、ソースには含めません。GitHub PagesのYouTube画面にも検索対応版へのリンクがあります。以下の作業記録には公開前の検証内容も含まれます。

# TESLA Cast — 関西版

Your entertainment. One screen.

助手席のスマートフォン・タブレット、または駐車中の車載画面から公式メディアサービスへ移動する、非公式の個人向けメディアランチャーです。Tesla, Inc.とは無関係です。Tesla実車での動作・各外部サービスの再生は未検証です。

## 起動

Node.js 22以降とnpmを使用してください。Macに古いNode.jsがある場合は、先にNode.jsを更新してください。

```sh
npm ci
npm run dev
```

http://127.0.0.1:3000 を開きます。メディアリンクと動画URLからの再生にはAPIキーは不要です。YouTubeのキーワード検索には、下記のYouTube連携設定が必要です。

```sh
npm test
npm run typecheck
npm run build
npm start
```

## 実装

- Next.js App Router、React、TypeScript、Tailwind CSS、Lucide React。
- `/`：YouTube・Netflix・TVer・地上波テレビ・Spotifyの5カード。
- `/tv`：関西12局の標準リモコン番号、対象地域、公式配信案内、確認元。
- `/youtube`：キーワード検索・サムネイル一覧・追加読み込み・YouTube公式プレーヤーでのサイト内視聴。動画URLからの再生も折りたたみ欄で利用できます。
- Netflix・TVer・Spotifyは通常の同一タブの外部リンク。YouTubeだけ公式iframeを使用し、再配信・DRM回避は行いません。
- 横長で5列、タブレットで3列、幅600px以下では大きな横型カード5行のホーム。テレビ局一覧は4／3／2／1列。
- 「スマホ・タブレットで使う」案内とリンクコピー。localhostのURLは別端末で開けないためコピーせず案内を表示。クリップボード非対応時は選択できるURLを表示。
- 操作要素は高さ48px以上。キーボードフォーカス・本文へのスキップリンク・画面拡大に対応。
- 404とアプリ内エラーの再試行画面。
- ホーム・テレビ一覧はビルド時に静的生成。外部画像・Webフォント・配信状況のポーリングはありません。
- ログイン・DB・課金・お気に入り・履歴・位置情報取得は実装していません。

## 配信情報の扱い

公式情報の確認日：2026-10-21。現在配信中であることを表す一覧ではありません。
情報は `lib/stations.ts` で手動管理します。配信範囲の変更やリンク切れを確認した場合は、確認日・根拠・ステータスを更新して再デプロイしてください。

| 放送局 | 標準リモコン番号・地域 | 実装上の対応 |
| --- | --- | --- |
| NHK大阪（総合） | 1・大阪府 | NHK ONE公式利用案内。大阪地域番組の配信範囲は未確認 |
| NHK Eテレ | 2・関西 | NHK ONE公式利用案内。同時・見逃し対象番組あり |
| MBS毎日放送 | 4・関西 | TVerリアルタイム一覧。TBS系列の対象番組のみ |
| ABCテレビ | 6・関西 | TVerリアルタイム一覧。テレビ朝日系列の対象番組のみ |
| 関西テレビ | 8・関西 | TVerリアルタイム一覧。フジテレビ系列の対象番組のみ |
| 読売テレビ | 10・関西 | TVerリアルタイム一覧。日本テレビ系列の対象番組のみ |
| テレビ大阪 | 7・大阪府 | TVerリアルタイム一覧。テレビ東京系列の対象番組のみ |
| サンテレビ | 3・兵庫県 | 対象番組の見逃し配信案内。常設リアルタイムは未確認 |
| KBS京都 | 5・京都府 | 「比叡の光」の見逃し配信案内。常設リアルタイムは未確認 |
| びわ湖放送 | 3・滋賀県 | 未確認。視聴リンクなし |
| 奈良テレビ | 9・奈良県 | 未確認。視聴リンクなし |
| テレビ和歌山 | 5・和歌山県 | 未確認。視聴リンクなし |

系列のリアルタイム配信は関西ローカル局の全放送の同時配信ではありません。過去の配信実績を含み、当日の対象番組はTVerで確認します。「未確認」と「リアルタイム配信なし」は区別します。今回は不存在を断定できる根拠がないため、独立局を「配信なし」とは記載していません。

NHK ONEは公式案内からサービスに進んでください。サービス側のアカウント・受信契約等の条件が適用されます。アプリ自身にログイン機能はありません。

### 確認元

- [NHK ONE公式案内資料](https://www.event.nhk.or.jp/file/fukushi_info.pdf)
- [NHK Eテレの同時・見逃し配信案内](https://www.event.nhk.or.jp/e-portal/detail.html?id=4695)
- [MBSのTVerリアルタイム配信発表](https://www.mbs.jp/kouhou/news/log/20220408_3846.shtml)
- [ABCのリアルタイム配信実績](https://abc-magazine.asahi.co.jp/post-74236/)
- [カンテレのリアルタイム・見逃し対象番組](https://www.ktv.jp/realtime/)
- [読売テレビのTVerリアルタイム配信発表](https://www.ytv.co.jp/corp/updata/file_ne0am6o3p75eln6yts2mhdd6mgb2r2.pdf)
- [テレビ大阪の対象番組配信案内](https://www.tv-osaka.co.jp/onair/detail/oaid%3D2184388/)
- [サンテレビ「播州秋まつり」見逃し案内](https://www.sun-tv.co.jp/program/akimatsuri/)
- [KBS京都「比叡の光」番組配信](https://www.kbs-kyoto.co.jp/tv/hiei/)
- [地域別標準番号：MAXZEN公式取扱説明書](https://maxzen.jp/wp-content/uploads/2023/08/72b97a7ce3cda2a7baf3bccfbabe34fe.pdf)
- [テレビ大阪：リモコン番号7](https://www.tv-osaka.co.jp/corporate/company.html)
- [びわ湖放送：リモコン番号3](https://www.bbc-tv.co.jp/disaster/index.php)
- [奈良テレビ：リモコン番号9](https://www.naratv.co.jp/tvninfo/area.html)
- [テレビ和歌山：5チャンネル](https://www.tv-wakayama.co.jp/special/50th/index.php)

番号は電波の物理チャンネルと異なります。NHK総合は各府県の地域放送で、いずれも標準番号は1です。受信機の再割り当てやケーブルテレビの番号、隣接県の受信可否までは保証しません。地域指定による配信制限の回避はしません。

## ファイル

```text
app/
  layout.tsx       日本語・メタ情報・画面設定
  page.tsx         ホーム
  globals.css      配色・レスポンシブ・タッチ領域
  tv/page.tsx      放送局一覧
  youtube/page.tsx YouTube視聴ページ
  error.tsx        再試行
  not-found.tsx    404
  icon.svg        アイコン
components/
  media-card.tsx   メディアカード・同一タブのリンク
  device-link.tsx  助手席の端末向け案内・URLコピー
  youtube-player.tsx 公式埋め込みプレーヤー・入力フォーム
  shell.tsx       ヘッダー・フッター・利用上の説明
lib/stations.ts   配信根拠・番号・ステータス
lib/youtube.ts    許可したYouTube動画URLからのID抽出
tests/stations.test.ts
```

## GitHubへの保存

このフォルダがプロジェクトのルートです。公開先はまだ設定されていません。

1. GitHubで空の `tesla-cast` リポジトリを作成します。公開範囲は用途に合わせて選びます。
2. このフォルダで以下を実行します。`YOUR_ACCOUNT` は自分のアカウント名に置き換えます。

```sh
git add .
git commit -m "Build TESLA Cast Kansai media launcher"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/tesla-cast.git
git push -u origin main
```

すでにoriginがある場合は追加せず、そのリポジトリを確認して使用してください。`node_modules`、`.next`、環境変数は除外済みです。

## Vercel公開

1. VercelにGitHubアカウントを接続します。
2. Add New → Projectから `tesla-cast` をImportします。
3. Framework PresetはNext.js、Root Directoryはリポジトリ直下、Node.jsは22以降。
4. Build Commandは `npm run build`、Install Commandは `npm ci`。Output DirectoryはNext.jsの既定値のままにします。YouTube検索を使う場合は環境変数 `YOUTUBE_API_KEY` を設定します。
5. Deploy後のHTTPS URLをPCとスマートフォンで確認し、駐車中のTeslaで開きます。

[Vercel公式のNext.js公開案内](https://vercel.com/docs/frameworks/full-stack/nextjs)

個人・非商用の試作は[Hobbyプラン](https://vercel.com/docs/plans/hobby)の対象範囲内で利用できます。動画・音楽サービス側の契約料金や通信費は別です。公開は今回未実施で、公開済みURLはありません。

## Tesla実車での受け入れ確認

- 車種、年式、ソフトウェア版、ブラウザの表示サイズを記録する。
- 駐車中にホームと地上波一覧が表示され、タッチで正しいリンクを開ける。
- 外部サービスのログイン、DRM動画・音楽、音声出力、全画面操作の可否。
- TVerの当日の対象番組・地域条件、NHK ONEの利用条件と大阪地域番組。
- 各外部サービスから戻る操作。外部サイトの履歴処理によっては複数回の戻るやURLの再入力が必要。
- モバイル回線／Wi-Fi、接続切断・再接続時の動作。
- ブラウザの既存の走行中制限が維持されること。本アプリは制限回避を実装しない。

自動テストは放送局データとリンクの掲載条件を対象とし、外部サービスの再生可否を検証するものではありません。

## 初回実装時の検証結果

- `npm run build`：成功。ホーム、テレビ一覧、404を静的生成。
- `npm run typecheck`：成功。
- `npm test`：4件成功。
- インストール時の依存パッケージ監査：脆弱性0件。
- ローカルChromeで1440×900、1280×720、768×1024、390×844、320×700を確認。ホーム5カード、テレビ12局、横方向のはみ出しなし、表示されるリンク・操作要素の高さ48px以上。
- ホーム→テレビ→ホーム、利用案内の開閉、404、4サービスのURLと同一タブ設定を確認。検証中のJavaScriptエラーなし。
- 外部サービスでのログイン・再生、Tesla実車、公開後のVercel環境は未検証。

この環境ではTurbopackの処理用ローカル通信が制限されたため、開発・ビルドにはNext.js公式のWebpackオプションを使用しています。

## 助手席のスマホ・タブレットで試す

公開後はVercelのHTTPS URLを端末のブラウザで開いてください。ホームの「スマホ・タブレットで使う」からURLをコピーできます。公式サービスのアプリが起動する場合もあります。動画再生は各サービスに任せ、独自の再生・制限回避は行いません。

公開前に試す場合は、PCと端末を同じ信頼できるWi-Fiにつなぎ、PCで `npm run dev:lan` を実行します。端末では `http://PCのLAN内IPアドレス:3000` を開きます。`127.0.0.1` はPC自身のアドレスなので、スマホからは使用できません。OSのファイアウォールやWi-Fiの端末間通信制限により接続できない場合があります。確認後はCtrl+Cで停止してください。通常の `npm run dev` はPC内のみでアクセスできます。

スマホ向け改修後のブラウザ自動操作は接続タイムアウトで実行できていません。上記の初回画面サイズ検証は改修前の結果です。改修後の実機表示、リンクコピー、各公式アプリへの遷移は公開前に端末で確認してください。

改修後の検証：`npm run build` 成功（型チェック・静的生成を含む）、`npm test` 4件成功。生成HTMLで端末向け案内・コピー操作・公式4サービスのリンクを確認しました。

## YouTubeのサイト内視聴

ホームでYouTubeを選ぶと `/youtube` に移動します。キーワードを入力して検索し、サムネイルを選択し、公式プレーヤー内で再生してください。「動画URLから開く」も利用できます。通常のwatch URL、youtu.be共有リンク、Shorts、live、embed形式と11文字の動画IDに対応します。

公式プレーヤーを表示するだけで、動画のダウンロード・代理配信・走行中制限の回避は行いません。キーワード検索にはYouTube Data APIを使用します。個人向けおすすめ・YouTubeアカウントへのログインは実装していません。動画URLからの再生にはAPIキーは不要です。動画URLや視聴履歴は保存しません。ページ再読み込みで入力は消えます。

入力から動画IDだけを抽出し、固定のYouTube公式ホストのiframe URLを構築します。ユーザー入力をそのままiframeに設定しません。動画を開くまではYouTubeへのプレーヤー接続は発生せず、自動再生もしません。検索時はGoogleにキーワードを送信し、検索結果のサムネイルはYouTubeから取得します。

埋め込み禁止、年齢・地域制限、非公開・削除済み動画などは再生できない場合があります。YouTube側のエラー表示に従ってください。ログインやブラウザ環境によっても再生可否は異なります。プレーヤー内のYouTubeリンクを利用した場合は公式サイトへ移動することがあります。

実装根拠：[YouTube公式の埋め込み仕様](https://developers.google.com/youtube/player_parameters)。実車および各動画の再生可否は未検証です。

URL形式の対応と、類似ドメイン・不正URL・HTMLを含む入力の拒否をテストしています。放送局テストと合わせて6件成功。ブラウザ確認ツールの接続タイムアウトにより、今回のプレーヤー操作・実動画再生は未検証です。

## YouTube検索の連携設定

1. [Google Cloud Console](https://console.cloud.google.com/)で自分のプロジェクトを作成・選択し、YouTube Data API v3を有効にします。
2. 認証情報からAPIキーを作成します。APIの制限は「YouTube Data API v3」に限定してください。この実装はサーバーから呼び出すため、ウェブサイトのHTTPリファラー制限用のキーは使用しません。固定送信元IPがある場合はIP制限を設定できます。
3. ローカルでは `.env.local` の `YOUTUBE_API_KEY=` の右にキーを設定します。空欄の設定ファイルは用意済みです。このファイルはGit管理対象外です。キーをチャットに送ったり、`NEXT_PUBLIC_`付きの環境変数に設定したりしないでください。
4. サーバーを再起動してください。ページを再読み込みすると検索できる状態になります。
5. Vercelではプロジェクトの環境変数に `YOUTUBE_API_KEY` を設定し、再デプロイします。

[Google公式の導入手順](https://developers.google.com/youtube/v3/getting-started)・[検索API仕様](https://developers.google.com/youtube/v3/docs/search/list)

キー未設定時は「検索は準備中です」と表示し、検索ボタンを無効にします。架空の動画を検索結果として表示しません。APIキーはサーバーの環境変数でのみ扱い、レスポンスや画面に含めません。上流APIのエラー本文もユーザーには返しません。

`/api/youtube/search` は最大12件ずつ、埋め込み・外部再生が可能な動画を検索します。検索はフォーム送信時のみ実行。同じ検索・ページの応答はプロセス内で10分間、最大100件までキャッシュします。検索語はこの一時キャッシュと通常のサーバーアクセスログに残る場合があります。個人の視聴履歴は保存しません。

APIの無駄な消費を抑えるため、プロセス単位で1分20回まで上流へのリクエストを許可します。サーバーレスの複数インスタンスにまたがる制限ではありません。Google Cloudの割り当て上限と利用状況も確認してください。無制限・永続無料での検索を保証するものではありません。

テストはGoogleへの通信を置き換えて、設定未完了・検索成功・キャッシュ・ページ送り・空の結果・403・通信失敗・不正なレスポンスの扱いを確認します。実APIキーを使う検索と実動画再生は、キー設定後に別途確認が必要です。

検索機能の検証結果：自動テスト8件成功（Google通信はモック）。ローカルサーバーで `/youtube` のHTTP 200と検索フォーム表示、キー未設定時のAPI 503・案内、空検索の400を確認しました。ブラウザ操作ツールは接続タイムアウトのため、実際の画面操作は未検証です。
`npm run build` も成功（型チェックを含む）。YouTubeページと検索APIは動的ルートとして生成されています。


## GitHub Pages簡易版

`npm run build:pages` で `out-pages/` に公開用HTMLを生成します。元のNext.jsアプリや稼働中の `.next` は変更しません。許可したソースだけを一時フォルダへコピーし、検索APIを除外します。`.env.local`、APIキー、サーバーの検索APIは公開しません。

- ホーム、5つのメディアカード、関西12局一覧、公式サイトへのリンクに対応。
- YouTubeは動画URLから公式埋め込みプレーヤーで再生。動画やブラウザによって再生できない場合があります。
- **簡易版ではサイト内のキーワード検索は使用できません。** YouTube公式サイトを開いて動画を探せます。検索対応の通常版は `npm run build` で引き続き利用できます。
- リポジトリ名は `GITHUB_REPOSITORY` から自動取得します。ローカルでは `/tesla-cast` を使用します。
- `components/device-link.tsx` のリンクコピーも、GitHub Pagesのリポジトリ名を含むURLに対応しています。

公開にはGitHubのPublicリポジトリが必要です。ファイルを `main` に保存し、リポジトリの **Settings → Pages → Source → GitHub Actions** を選択します。`.github/workflows/pages.yml` がテスト・ビルド・公開を実行します。初回に設定が間に合わず失敗した場合はActionsから再実行してください。GitHub Actionsでの公開成功後、Pages画面に表示されるURLを使います。

APIキーをGitHub Secretsに登録する必要はありません。生成された `out-pages/` や `.env.local` をリポジトリに保存しないでください。GitHub側の公開設定と実際の公開URL確認は、保存先リポジトリの接続後に行います。

GitHub Pages版のローカル検証：`npm run build:pages` 成功（型チェックを含む）、既存の自動テスト8件成功。生成した3ページの内部リンク・画像・スクリプトが `/tesla-cast/` 配下に存在すること、検索非対応の案内と動画URL入力欄があること、生成物に検索API・環境ファイル・実APIキーがないことを確認しました。公開先と実ブラウザでの再生は未検証です。

## Spotifyのサイト内プレーヤー

`/spotify` でSpotifyの共有URLを入力すると公式埋め込みプレーヤーを表示します。曲・アルバム・プレイリスト・アーティスト・番組・エピソードに対応。HTTPSの `open.spotify.com` と正しいコンテンツIDだけを許可し、追跡パラメータを除去します。短縮URLは公式サイトで開いた後のURLを入力してください。APIキー不要、URLの保存なし、自動再生なし。フル再生可否はSpotify側の条件によります。歌詞・曲名検索は未対応です。Tesla実車と実音声再生は未検証。

Spotify追加後の自動テストは10件成功。公式仕様：https://developer.spotify.com/documentation/embeds
