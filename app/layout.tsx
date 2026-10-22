import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "TESLA Cast — 関西版", description: "Your entertainment. One screen. 助手席のスマホ・タブレットと、駐車中の車載画面で使える関西のメディアランチャー。" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0B0D12" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body><a href="#main" className="skip-link">本文へ移動</a>{children}</body></html>;
}
