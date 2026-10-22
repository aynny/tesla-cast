"use client";

import { useState } from "react";
import { Copy, Smartphone } from "lucide-react";

export function DeviceLink() {
  const [message, setMessage] = useState("");
  const [manualUrl, setManualUrl] = useState("");

  async function copyLink() {
    const url = new URL(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`, window.location.href);
    if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      setMessage("このプレビューは、このパソコン専用です。スマホで使うには、公開後のURLか同じWi-Fi内の共有用URLを開いてください。");
      return;
    }
    try {
      await navigator.clipboard.writeText(url.href);
      setManualUrl("");
      setMessage("リンクをコピーしました。助手席のスマホ・タブレットに送り、ブラウザで開いてください。");
    } catch {
      setManualUrl(url.href);
      setMessage("自動コピーが利用できません。下のURLを長押ししてコピーしてください。");
    }
  }

  return <details className="device-guide">
    <summary><Smartphone size={18} aria-hidden="true" />スマホ・タブレットで使う</summary>
    <div className="device-guide-body">
      <p>助手席の方の端末でこのサイトを開き、メディアを選んでください。YouTubeは動画URLからサイト内で再生できます。検索対応版では検索結果からも選べます。その他の視聴は移動先の公式サイトやアプリで行います。</p>
      <button type="button" className="station-link" onClick={copyLink}><Copy size={17} aria-hidden="true" />このサイトのリンクをコピー</button>
      <p role="status" aria-live="polite">{message}</p>
      {manualUrl && <label className="manual-url">このサイトのURL<input readOnly value={manualUrl} onFocus={event => event.currentTarget.select()} /></label>}
      <p>車載画面での動画は駐車中に。運転者は走行中に動画を視聴・操作しないでください。</p>
    </div>
  </details>;
}
