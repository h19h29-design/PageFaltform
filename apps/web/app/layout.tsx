import type { Metadata } from "next";
import {
  Do_Hyeon,
  Gowun_Batang,
  IBM_Plex_Sans_KR,
  Jua,
  Noto_Sans_KR,
  Noto_Serif_KR,
} from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-serif-kr",
});

const gowunBatang = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gowun-batang",
});

const ibmPlexSansKr = IBM_Plex_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ibm-plex-sans-kr",
});

const doHyeon = Do_Hyeon({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-do-hyeon",
});

const jua = Jua({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jua",
});

export const metadata: Metadata = {
  title: "B-page",
  description: "가족홈과 클럽을 하나의 메인에서 고르고 이어서 쓰는 B-page 통합 플랫폼입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={[
          notoSansKr.variable,
          notoSerifKr.variable,
          gowunBatang.variable,
          ibmPlexSansKr.variable,
          doHyeon.variable,
          jua.variable,
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
