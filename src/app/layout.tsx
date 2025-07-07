import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fragments of Structure",
  description: "Not mine. Not yours. Just fragments left behind.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Zen+Kurenaido&display=swap" 
          rel="stylesheet" 
        />
        {/* Satoshiフォントはローカルで追加するか、代替フォントを使用 */}
      </head>
      <body>{children}</body>
    </html>
  );
}