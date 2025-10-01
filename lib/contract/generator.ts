import { ContractFormData, GeneratedContract, ContractTemplate } from '@/types/contract';
import { formatCurrency } from '../utils/currency-format';
import { formatDate } from '../utils/date-helpers';

export function generateContract(
  formData: ContractFormData,
  template: ContractTemplate
): GeneratedContract {
  let content = `# ${template.name}\n\n`;
  content += `생성일: ${formatDate(new Date())}\n\n`;
  content += `---\n\n`;

  // 섹션들을 순서대로 정렬
  const sortedSections = Object.entries(template.sections)
    .sort(([, a], [, b]) => a.order - b.order);

  sortedSections.forEach(([key, section]) => {
    content += `## ${section.title}\n\n`;

    let sectionContent = section.template;

    // 변수 치환
    sectionContent = replaceVariables(sectionContent, formData);

    content += `${sectionContent}\n\n`;
  });

  // 법적 면책 조항
  content += `---\n\n`;
  content += `## 법적 고지\n\n`;
  content += `${template.legal_disclaimer}\n\n`;

  // 서명란
  content += `---\n\n`;
  content += `## 서명\n\n`;
  content += `**갑 (클라이언트)**\n`;
  content += `성명: ${formData.clientName || '______________'} (인)\n`;
  if (formData.clientContact) {
    content += `연락처: ${formData.clientContact}\n`;
  }
  content += `날짜: ______________\n\n`;
  content += `**을 (예술가)**\n`;
  content += `성명: ${formData.artistName || '______________'} (인)\n`;
  if (formData.artistContact) {
    content += `연락처: ${formData.artistContact}\n`;
  }
  if (formData.artistIdNumber) {
    content += `주민등록번호(뒷자리) 또는 사업자번호: ${formData.artistIdNumber}\n`;
  }
  if (formData.artistAddress) {
    content += `주소: ${formData.artistAddress}\n`;
  }
  content += `날짜: ______________\n\n`;

  return {
    id: `contract_${Date.now()}`,
    formData,
    template,
    content,
    createdAt: new Date(),
    completeness: formData.completeness,
    warnings: formData.warnings,
  };
}

function replaceVariables(template: string, data: ContractFormData): string {
  let result = template;

  // 클라이언트 정보
  result = result.replace(/{client_name}/g, data.clientName || '[클라이언트 이름 미정]');
  result = result.replace(/{client_contact}/g, data.clientContact || '[연락처 미정]');

  // 예술가 정보 (Step 0에서 입력받음)
  result = result.replace(/{artist_name}/g, data.artistName || '[예술가 이름 미정]');
  result = result.replace(/{artist_contact}/g, data.artistContact || '[예술가 연락처 미정]');
  result = result.replace(/{artist_id}/g, data.artistIdNumber || '[미정]');
  result = result.replace(/{artist_address}/g, data.artistAddress || '[미정]');

  // 작업 내용
  result = result.replace(/{work_type}/g, data.workType || data.workDescription || '[작업 내용 미정]');
  result = result.replace(/{work_description}/g, data.workDescription || '[상세 설명 미정]');

  // 기한
  if (data.timeline?.deadline) {
    result = result.replace(/{deadline}/g, formatDate(data.timeline.deadline));
  } else {
    result = result.replace(/{deadline}/g, '[마감일 미정]');
  }

  if (data.timeline?.startDate) {
    result = result.replace(/{start_date}/g, formatDate(data.timeline.startDate));
  } else {
    result = result.replace(/{start_date}/g, '[시작일 미정]');
  }

  // 금액
  if (data.payment?.amount) {
    result = result.replace(/{amount}/g, formatCurrency(data.payment.amount));

    // 계약금
    if (data.payment.deposit) {
      const balance = data.payment.amount - data.payment.deposit;
      result = result.replace(
        /{payment_schedule}/g,
        `계약금: ${formatCurrency(data.payment.deposit)} (계약 시)\n잔금: ${formatCurrency(balance)} (작업 완료 후)`
      );
    } else {
      result = result.replace(/{payment_schedule}/g, '전액 [지급 시기 미정]');
    }

    result = result.replace(/{payment_method}/g, data.payment.paymentMethod || '[지급 방법 미정]');
  } else {
    result = result.replace(/{amount}/g, '[금액 미정]');
    result = result.replace(/{payment_schedule}/g, '[지급 일정 미정]');
    result = result.replace(/{payment_method}/g, '[지급 방법 미정]');
  }

  // 수정 횟수
  if (data.revisions === 'unlimited') {
    result = result.replace(/{revisions}/g, '무제한 ⚠️');
  } else if (data.revisions !== null && data.revisions !== undefined) {
    result = result.replace(/{revisions}/g, data.revisions.toString());
  } else {
    result = result.replace(/{revisions}/g, '[미정]');
  }

  if (data.additionalRevisionFee) {
    result = result.replace(/{additional_fee}/g, formatCurrency(data.additionalRevisionFee));
  } else {
    result = result.replace(/{additional_fee}/g, '[미정]');
  }

  // 사용 범위
  if (data.usageScope && data.usageScope.length > 0) {
    const scopeMap: { [key: string]: string } = {
      personal: '개인적 사용',
      commercial: '상업적 사용',
      online: '온라인 사용',
      print: '인쇄물 사용',
      unlimited: '무제한',
    };

    const scopes = data.usageScope.map((s) => scopeMap[s] || s).join(', ');
    result = result.replace(/{usage_scope}/g, scopes);
  } else {
    result = result.replace(/{usage_scope}/g, '[사용 범위 미정]');
  }

  result = result.replace(/{commercial_use}/g, data.commercialUse ? '허용' : '불허');

  // 음악 분야 특화 변수
  result = result.replace(/{duration}/g, '[재생시간 미정]'); // 예: "3분 30초"

  // 글쓰기 분야 특화 변수
  result = result.replace(/{word_count}/g, '[분량 미정]'); // 예: "2,000자"

  // 사진/영상 분야 특화 변수
  result = result.replace(/{deliverables}/g, '[제공 컷수 미정]'); // 예: "보정본 30컷"
  result = result.replace(/{shoot_date}/g, '[촬영일시 미정]'); // 예: "2025년 1월 15일 오후 2시"

  return result;
}

export function exportToText(contract: GeneratedContract): string {
  return contract.content;
}

export function exportToMarkdown(contract: GeneratedContract): string {
  return contract.content;
}
