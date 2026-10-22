export type LiveStatus = "partial" | "nhk" | "none" | "unknown";
export type Station = {
  id: string;
  name: string;
  mark: string;
  channel: number;
  area: string;
  live: LiveStatus;
  liveUrl?: string;
  replayUrl?: string;
  source?: string;
  note: string;
};

export const checkedAt = "2026-10-21";
export const channelSource = "https://maxzen.jp/wp-content/uploads/2023/08/72b97a7ce3cda2a7baf3bccfbabe34fe.pdf";
export const stations: Station[] = [
  { id: "nhk", name: "NHK大阪（総合）", mark: "NHK", channel: 1, area: "大阪府", live: "nhk", liveUrl: "https://www.nhk.jp/nhkone/", source: "https://www.event.nhk.or.jp/file/fukushi_info.pdf", note: "NHK ONEの公式案内へ。大阪の地域番組の配信範囲はサービス内でご確認ください。" },
  { id: "etv", name: "NHK Eテレ", mark: "Eテレ", channel: 2, area: "関西", live: "nhk", liveUrl: "https://www.nhk.jp/nhkone/", source: "https://www.event.nhk.or.jp/e-portal/detail.html?id=4695", note: "NHK ONEの公式案内へ。対象番組・利用条件はサービス内でご確認ください。" },
  { id: "mbs", name: "MBS毎日放送", mark: "MBS", channel: 4, area: "関西", live: "partial", liveUrl: "https://tver.jp/live", source: "https://www.mbs.jp/kouhou/news/log/20220408_3846.shtml", note: "TBS系列の対象番組。MBSの地域放送を常時配信するものではありません。" },
  { id: "abc", name: "ABCテレビ", mark: "ABC", channel: 6, area: "関西", live: "partial", liveUrl: "https://tver.jp/live", source: "https://abc-magazine.asahi.co.jp/post-74236/", note: "テレビ朝日系列の対象番組。過去の配信実績を確認。現在の番組はTVerでご確認ください。" },
  { id: "ktv", name: "関西テレビ", mark: "カンテレ", channel: 8, area: "関西", live: "partial", liveUrl: "https://tver.jp/live", source: "https://www.ktv.jp/realtime/", note: "フジテレビ系列の対象番組。関西の放送内容・時間と異なる場合があります。" },
  { id: "ytv", name: "読売テレビ", mark: "ytv", channel: 10, area: "関西", live: "partial", liveUrl: "https://tver.jp/live", source: "https://www.ytv.co.jp/corp/updata/file_ne0am6o3p75eln6yts2mhdd6mgb2r2.pdf", note: "日本テレビ系列の対象番組。読売テレビの全番組の同時配信ではありません。" },
  { id: "tvo", name: "テレビ大阪", mark: "TVO", channel: 7, area: "大阪府", live: "partial", liveUrl: "https://tver.jp/live", source: "https://www.tv-osaka.co.jp/onair/detail/oaid%3D2184388/", note: "テレビ東京系列の対象番組。現在の配信予定はTVerでご確認ください。" },
  { id: "sun", name: "サンテレビ", mark: "SUN", channel: 3, area: "兵庫県", live: "unknown", replayUrl: "https://www.sun-tv.co.jp/program/akimatsuri/", source: "https://www.sun-tv.co.jp/program/akimatsuri/", note: "対象番組の見逃し配信案内を確認。常設のリアルタイム配信は未確認です。" },
  { id: "kbs", name: "KBS京都", mark: "KBS", channel: 5, area: "京都府", live: "unknown", replayUrl: "https://www.kbs-kyoto.co.jp/tv/hiei/", source: "https://www.kbs-kyoto.co.jp/tv/hiei/", note: "「比叡の光」の見逃し配信案内。常設のリアルタイム配信は未確認です。" },
  { id: "bbc", name: "びわ湖放送", mark: "BBC", channel: 3, area: "滋賀県", live: "unknown", note: "公式のリアルタイム・見逃し配信の対応状況は未確認です。" },
  { id: "tvn", name: "奈良テレビ", mark: "TVN", channel: 9, area: "奈良県", live: "unknown", note: "公式のリアルタイム・見逃し配信の対応状況は未確認です。" },
  { id: "wtv", name: "テレビ和歌山", mark: "WTV", channel: 5, area: "和歌山県", live: "unknown", note: "公式のリアルタイム・見逃し配信の対応状況は未確認です。" },
];

export function liveLabel(status: LiveStatus): string {
  return { partial: "対象番組のみリアルタイム", nhk: "NHK ONE・同時／見逃し", none: "リアルタイム配信なし", unknown: "リアルタイム配信：未確認" }[status];
}
