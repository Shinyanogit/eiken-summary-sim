import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "英険1級 要約シュミレーター",
  description: "あなたは0点を回避できるか？英険1級 英文要約問題シュミレーター",
  openGraph: {
    title: "英険1級 要約シュミレーター",
    description: "あなたは0点を回避できるか？英険1級 英文要約問題シュミレーター",
    type: "website",
    images: [{ url: "/api/og-top", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "英険1級 要約シュミレーター",
    description: "あなたは0点を回避できるか？",
    images: ["/api/og-top"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${notoSerif.variable} antialiased`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 no-underline">
              <span
                className="text-xl font-bold tracking-tight"
                style={{ color: "var(--eiken-navy)" }}
              >
                英険1級 要約シュミレーター
              </span>
            </a>
            <nav className="text-sm text-gray-500">
              Grade 1 Writing
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer
          className="text-white text-sm mt-12"
          style={{ background: "var(--eiken-dark)" }}
        >
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <p className="text-gray-300 text-xs leading-relaxed">
              本サイトは公益財団法人 日本英語検定協会が運営する「実用英語技能検定（英検&reg;）」とは一切関係がありません。
              <br />
              英検&reg;は同協会の登録商標です。本サイトにおける「英険」は架空の検定であり、採点基準・結果に信頼性はありません。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
