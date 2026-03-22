import "./globals.css";
export const metadata = {
    title: "YSplan",
    description: "가족 홈 진입, 권한 분리, 대시보드 구조를 함께 실험하는 플랫폼 스켈레톤",
};
export default function RootLayout({ children, }) {
    return (<html lang="ko">
      <body>{children}</body>
    </html>);
}
