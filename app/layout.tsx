import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Амьтан — Хайртай гэр бүлээ олоорой",
  description: "Халамжтай гэр бүл хайж буй нохой, мууртай танилцаж, үрчлэлтийн хүсэлтээ илгээгээрэй.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
