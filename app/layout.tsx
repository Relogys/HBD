import "./globals.css";

export const metadata = {
  title: "刘雅贞 · 岁岁年年",
  description: "Happy Birthday to Liu Yazhen",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      {/* 直接在 style 属性里指定字体，绕过 Next.js 的检查 */}
      <body style={{ fontFamily: "'Noto Serif SC', serif" }} className="bg-[#fdfbf7] text-[#2c2c2c] antialiased selection:bg-orange-100">
        {children}
      </body>
    </html>
  );
}