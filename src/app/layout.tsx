import type { Metadata, Viewport } from "next";
import { Baloo_2, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-body",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Everbook — หนังสือภาพส่วนตัวคุณภาพสูง",
  description:
    "เปลี่ยนรูปในมือถือให้เป็นหนังสือภาพปกแข็งสุดสวยภายในไม่กี่นาที ออกแบบเอง พิมพ์คุณภาพสูง ส่งทั่วประเทศ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#FBFAF7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${baloo.variable} ${notoThai.variable} bg-background`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
