export function formatCurrency(amount: number, currency: string = 'KRW'): string {
  if (currency === 'KRW') {
    return `${amount.toLocaleString('ko-KR')}원`;
  }
  return `${amount.toLocaleString()} ${currency}`;
}

export function parseCurrency(input: string): number | null {
  // ✅ 소수점(.)도 허용하도록 수정
  const cleaned = input.replace(/[^\d.]/g, '');
  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
}
