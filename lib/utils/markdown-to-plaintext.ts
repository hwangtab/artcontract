/**
 * 마크다운 텍스트를 일반 텍스트로 변환
 * 계약서 복사/다운로드 시 사용자 친화적인 형식으로 제공
 */

export function stripMarkdown(markdown: string): string {
  if (!markdown) return '';

  let text = markdown;

  // 1. 제목 (### 제목) → 제목 텍스트만
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1');

  // 2. 강조 (**텍스트**, __텍스트__) → 텍스트
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/__(.+?)__/g, '$1');

  // 3. 기울임 (*텍스트*, _텍스트_) → 텍스트
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');

  // 4. 리스트 (- 항목) → • 항목
  text = text.replace(/^[\-\*\+]\s+(.+)$/gm, '• $1');

  // 5. 숫자 리스트 (1. 항목) → 1. 항목 (유지)
  // 계약서는 조항 번호가 중요하므로 그대로 유지

  // 6. 링크 [텍스트](url) → 텍스트
  text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1');

  // 7. 인라인 코드 (`코드`) → 코드
  text = text.replace(/`(.+?)`/g, '$1');

  // 8. 수평선 (---, ***, ___) → 빈 줄
  text = text.replace(/^[\-\*_]{3,}$/gm, '');

  // 9. 연속된 빈 줄 정리 (3개 이상 → 2개)
  text = text.replace(/\n{3,}/g, '\n\n');

  // 10. 앞뒤 공백 제거
  text = text.trim();

  return text;
}

/**
 * 마크다운을 파일 다운로드용 텍스트로 변환
 * 추가로 구분선 등을 넣어 가독성 향상
 */
export function markdownToDownloadText(markdown: string): string {
  const plainText = stripMarkdown(markdown);

  // 계약서 상단에 생성 정보 추가
  const header = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
생성일시: ${new Date().toLocaleString('ko-KR')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

  const footer = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
본 계약서는 ArtContract로 생성되었습니다.
https://artcontract.vercel.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  return header + plainText + footer;
}
