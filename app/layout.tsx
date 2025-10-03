import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '한국스마트협동조합 예술인 계약서 작성 도우미',
  description:
    '5분만에 안전한 계약서를 만드세요. AI가 위험을 미리 경고하고 보호합니다. 모든 예술가를 위한 무료 서비스.',
  keywords: [
    '한국스마트협동조합',
    '예술인',
    '예술가',
    '계약서',
    'AI',
    '프리랜서',
    '디자이너',
    '일러스트레이터',
    '작가',
    '음악가',
  ],
  authors: [{ name: '한국스마트협동조합' }],
  openGraph: {
    title: '한국스마트협동조합 예술인 계약서 작성 도우미',
    description: '5분만에 안전한 계약서를 만드세요. AI가 위험을 미리 경고하고 보호합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
