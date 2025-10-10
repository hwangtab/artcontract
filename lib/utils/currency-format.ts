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

/**
 * 한글 화폐 단위를 포함한 입력을 숫자로 변환
 * @param input "100만원", "1억", "1억5천만원" 등
 * @returns 변환된 숫자 또는 undefined
 *
 * @example
 * parseKoreanCurrency("100만원") // 1000000
 * parseKoreanCurrency("1억") // 100000000
 * parseKoreanCurrency("1억5천만원") // 150000000
 * parseKoreanCurrency("50만") // 500000
 */
export function parseKoreanCurrency(input: string): number | undefined {
  if (!input || typeof input !== 'string') return undefined;

  // 쉼표와 공백 제거
  let value = input.trim().replace(/,/g, '').replace(/\s/g, '');

  // '원' 제거
  value = value.replace(/원/g, '');

  // 한글 단위가 없으면 일반 숫자로 파싱
  if (!value.includes('억') && !value.includes('만') && !value.includes('천')) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }

  let total = 0;

  // 억 단위 처리
  if (value.includes('억')) {
    const parts = value.split('억');
    const eokPart = parseFloat(parts[0]);
    if (!isNaN(eokPart)) {
      total += eokPart * 100000000; // 억 = 100,000,000
    }
    value = parts[1] || ''; // 나머지 부분
  }

  // 만 단위 처리
  if (value.includes('만')) {
    const parts = value.split('만');
    let manPart = parts[0];

    // 천만 처리 (예: "5천만")
    if (manPart.includes('천')) {
      const cheonParts = manPart.split('천');
      const cheon = parseFloat(cheonParts[0]);
      if (!isNaN(cheon)) {
        total += cheon * 10000000; // 천만 = 10,000,000
      }
    } else {
      const man = parseFloat(manPart);
      if (!isNaN(man)) {
        total += man * 10000; // 만 = 10,000
      }
    }
    value = parts[1] || '';
  }

  // 천 단위 처리 (단독으로 남은 경우)
  if (value.includes('천')) {
    const parts = value.split('천');
    const cheonPart = parseFloat(parts[0]);
    if (!isNaN(cheonPart)) {
      total += cheonPart * 1000;
    }
    value = parts[1] || '';
  }

  // 남은 숫자 처리
  if (value) {
    const remaining = parseFloat(value);
    if (!isNaN(remaining)) {
      total += remaining;
    }
  }

  return total > 0 ? total : undefined;
}
