export function formatCurrency(amount: number, currency: string = 'KRW'): string {
  if (currency === 'KRW') {
    return `${amount.toLocaleString('ko-KR')}원`;
  }
  return `${amount.toLocaleString()} ${currency}`;
}

export function parseCurrency(input: string): number | null {
  const cleaned = input.replace(/[^\d]/g, '');
  const number = parseInt(cleaned, 10);
  return isNaN(number) ? null : number;
}
