import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArtContract - 예술가를 위한 계약서 자동 생성',
  description:
    '5분만에 안전한 계약서를 만드세요. AI가 위험을 미리 경고하고 보호합니다. 모든 예술가를 위한 무료 서비스.',
  keywords: [
    '예술가',
    '계약서',
    'AI',
    '프리랜서',
    '디자이너',
    '일러스트레이터',
    '작가',
    '음악가',
  ],
  authors: [{ name: 'ArtContract Team' }],
  openGraph: {
    title: 'ArtContract - 예술가를 위한 계약서 자동 생성',
    description: '5분만에 안전한 계약서를 만드세요',
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
