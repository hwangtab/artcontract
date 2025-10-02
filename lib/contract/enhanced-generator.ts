import { EnhancedContractFormData, ContractFormData, GeneratedContract, ContractTemplate } from '@/types/contract';
import { formatCurrency } from '../utils/currency-format';
import { formatDate } from '../utils/date-helpers';

/**
 * 표준계약서 기반 13개 필수 조항 생성기
 * 문화체육관광부 표준계약서 구조 준수
 */

export function generateEnhancedContract(
  formData: EnhancedContractFormData | ContractFormData,
  template: ContractTemplate
): GeneratedContract {
  const isEnhanced = hasEnhancedFeatures(formData);

  let content = '';

  if (isEnhanced) {
    // 표준계약서 형식
    content = generateStandardContract(formData as EnhancedContractFormData);
  } else {
    // 기존 간단한 형식 (하위 호환성)
    content = generateBasicContract(formData, template);
  }

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

function hasEnhancedFeatures(formData: EnhancedContractFormData | ContractFormData): boolean {
  const enhanced = formData as EnhancedContractFormData;
  return !!(
    enhanced.copyrightTerms ||
    enhanced.enhancedPayment ||
    enhanced.protectionClauses ||
    enhanced.terminationTerms ||
    enhanced.disputeResolution
  );
}

// ========== 표준계약서 생성 (13개 조항) ==========

function generateStandardContract(formData: EnhancedContractFormData): string {
  const fieldName = getFieldName(formData.field);

  let content = `# ${fieldName} 창작 계약서\n\n`;
  content += `${formData.clientName || '[의뢰인명]'}(이하 "갑")과 ${formData.artistName || '[창작자명]'}(이하 "을")는 `;
  content += `${formData.workType || formData.workDescription || '[작업명]'}의 창작에 관하여 다음과 같이 계약을 체결한다.\n\n`;
  content += `---\n\n`;

  // 13개 필수 조항
  content += generateArticle1_Purpose(formData);
  content += generateArticle2_Subject(formData);
  content += generateArticle3_Duration(formData);
  content += generateArticle4_ClientObligations(formData);
  content += generateArticle5_ArtistObligations(formData);
  content += generateArticle6_Payment(formData);
  content += generateArticle7_RightsAttribution(formData);

  // 보호 조항 (선택적)
  if (formData.protectionClauses?.creditAttribution) {
    content += generateArticle8_CreditAttribution(formData);
  }
  if (formData.protectionClauses?.modificationRights || formData.revisions !== undefined) {
    content += generateArticle9_Modifications(formData);
  }

  // 필수 조항 계속
  if (formData.terminationTerms) {
    content += generateArticle10_Termination(formData);
  }
  if (formData.protectionClauses?.confidentiality) {
    content += generateArticle11_Confidentiality(formData);
  }
  if (formData.disputeResolution) {
    content += generateArticle12_DisputeResolution(formData);
  }

  content += generateArticle13_Effectiveness(formData);

  // 서명란
  content += generateSignatureSection(formData);

  // 법적 면책
  content += `\n---\n\n`;
  content += `## 법적 고지\n\n`;
  content += `본 계약서는 예술가를 위한 표준계약서 템플릿이며, 법률 자문을 대체하지 않습니다. `;
  content += `계약 체결 전 법률 전문가의 검토를 권장합니다.\n\n`;

  return content;
}

// 제1조: 계약의 목적
function generateArticle1_Purpose(formData: EnhancedContractFormData): string {
  const workName = formData.workType || formData.workDescription || '[작업명]';

  return `## 제1조 (계약의 목적)

본 계약은 **${workName}**의 창작에 관한 당사자 간의 권리와 의무를 정함을 목적으로 한다.

---

`;
}

// 제2조: 계약의 대상
function generateArticle2_Subject(formData: EnhancedContractFormData): string {
  const fieldName = getFieldName(formData.field);
  const workDescription = formData.workDescription || '[상세 설명 미정]';

  return `## 제2조 (계약의 대상)

본 계약의 대상은 다음과 같다:

1. **작업 분야**: ${fieldName}
2. **작업 내용**: ${workDescription}
3. **납품 형태**: ${get납품형태(formData)}

---

`;
}

// 제3조: 계약기간
function generateArticle3_Duration(formData: EnhancedContractFormData): string {
  const startDate = formData.timeline?.startDate ? formatDate(formData.timeline.startDate) : '[시작일 미정]';
  const deadline = formData.timeline?.deadline ? formatDate(formData.timeline.deadline) : '[마감일 미정]';

  return `## 제3조 (계약기간)

① 계약 기간: ${startDate} ~ ${deadline}

② 작업 착수일: ${startDate}

③ 납품 기한: ${deadline}

④ 기한 연장이 필요한 경우 당사자의 서면 합의로 변경할 수 있다.

---

`;
}

// 제4조: 의뢰인의 의무
function generateArticle4_ClientObligations(formData: EnhancedContractFormData): string {
  return `## 제4조 (의뢰인의 의무)

① 갑은 을에게 작업에 필요한 자료와 정보를 제공한다.

② 갑은 제6조에 따라 대금을 지급한다.

③ 갑은 을의 안전과 건강을 배려하여야 한다.${formData.protectionClauses?.safetyObligations?.insuranceRequired ? '\n   - 을에 대한 상해보험을 가입한다. (보험료는 갑 부담)' : ''}

④ 갑은 을의 저작인격권을 존중하고 침해하지 않는다.

---

`;
}

// 제5조: 창작자의 의무
function generateArticle5_ArtistObligations(formData: EnhancedContractFormData): string {
  return `## 제5조 (창작자의 의무)

① 을은 본 계약을 성실히 이행한다.

② 을은 작업 기한을 준수하며, 부득이한 사유로 지연되는 경우 즉시 갑에게 통지한다.

③ 을은 계약 내용에 부합하는 품질을 보증한다.

④ 을은 제3자의 저작권을 침해하지 않음을 보증한다.

---

`;
}

// 제6조: 대금 지급 ⭐ 핵심
function generateArticle6_Payment(formData: EnhancedContractFormData): string {
  const enhancedPayment = formData.enhancedPayment;
  const basicPayment = formData.payment;

  let content = `## 제6조 (대금 지급)\n\n`;

  if (enhancedPayment) {
    // 3단계 지급 구조
    const total = enhancedPayment.totalAmount;
    const installments = enhancedPayment.installments;

    content += `① 갑은 을에게 다음과 같이 대금을 지급한다:\n\n`;
    content += `   - **총 금액**: 금 ${total.toLocaleString()}원 정 (₩${total.toLocaleString()})\n\n`;

    if (installments) {
      if (installments.downPayment) {
        content += `   - **계약금**: ${installments.downPayment.percentage}% (₩${installments.downPayment.amount.toLocaleString()}) - 계약 체결 즉시\n`;
      }
      if (installments.midPayment) {
        content += `   - **중도금**: ${installments.midPayment.percentage}% (₩${installments.midPayment.amount.toLocaleString()}) - ${installments.midPayment.milestone}\n`;
      }
      if (installments.finalPayment) {
        content += `   - **잔금**: ${installments.finalPayment.percentage}% (₩${installments.finalPayment.amount.toLocaleString()}) - 작업 완료 후 ${installments.finalPayment.dueDate}일 이내\n\n`;
      }
    }

    if (enhancedPayment.bankAccount) {
      content += `② 지급 방법: 다음 계좌로 이체\n\n`;
      content += `   - 은행: ${enhancedPayment.bankAccount.bank}\n`;
      content += `   - 예금주: ${enhancedPayment.bankAccount.accountHolder}\n`;
      content += `   - 계좌번호: ${enhancedPayment.bankAccount.accountNumber}\n\n`;
    }

    if (enhancedPayment.lateInterest?.enabled) {
      content += `③ 지급 기일을 경과한 경우 연 ${enhancedPayment.lateInterest.annualRate}%의 지연이자를 가산한다.\n\n`;
    }
  } else if (basicPayment?.amount) {
    // 기존 간단한 지급 구조
    content += `① 총 금액: **${formatCurrency(basicPayment.amount)}**\n\n`;

    if (basicPayment.deposit) {
      const balance = basicPayment.amount - basicPayment.deposit;
      content += `② 지급 일정:\n`;
      content += `   - 계약금: ${formatCurrency(basicPayment.deposit)} (계약 시)\n`;
      content += `   - 잔금: ${formatCurrency(balance)} (작업 완료 후)\n\n`;
    } else {
      content += `② 지급 시기: [협의 필요]\n\n`;
    }
  } else {
    content += `① 총 금액: **[금액 미정]**\n\n`;
    content += `⚠️ 금액이 정해지지 않았습니다. 반드시 협의하여 명시하세요.\n\n`;
  }

  content += `---\n\n`;
  return content;
}

// 제7조: 권리의 귀속 ⭐⭐ 가장 중요
function generateArticle7_RightsAttribution(formData: EnhancedContractFormData): string {
  const copyright = formData.copyrightTerms;

  let content = `## 제7조 (권리의 귀속)\n\n`;

  if (copyright) {
    // 상세한 저작권 관리
    const rightsTypeKor = {
      'full_transfer': '전부 양도',
      'partial_transfer': '일부 양도',
      'exclusive_license': '독점적 이용허락',
      'non_exclusive_license': '비독점적 이용허락',
    }[copyright.rightsType];

    content += `① 본 저작물의 저작재산권은 **${rightsTypeKor}** 방식으로 처리된다.\n\n`;

    // 저작인격권 (항상 창작자 보유)
    content += `② **저작인격권은 을에게 유보되며, 어떠한 경우에도 양도될 수 없다.** (저작권법 제14조)\n`;
    content += `   - 성명표시권: 을의 이름을 표시할 권리\n`;
    content += `   - 동일성유지권: 작품이 훼손되지 않을 권리\n`;
    content += `   - 공표권: 작품 공개 여부를 결정할 권리\n\n`;

    // 2차적저작물작성권
    if (copyright.derivativeWorks.separateNegotiation) {
      content += `③ **2차적저작물작성권**(번역, 각색, 변형, 영상화 등)은 본 계약에 포함되지 않으며,\n`;
      content += `   별도의 협의와 보상을 통해서만 행사할 수 있다.\n\n`;
    } else if (copyright.derivativeWorks.included && copyright.derivativeWorks.additionalFee) {
      content += `③ **2차적저작물작성권**은 추가 대금 ${formatCurrency(copyright.derivativeWorks.additionalFee)}을 지급하고 갑에게 양도한다.\n\n`;
    }

    // 저작재산권 상세
    content += `④ 갑이 사용할 수 있는 저작재산권의 범위:\n`;
    const rights = copyright.economicRights;
    if (rights.reproduction) content += `   - 복제권: 작품을 복사, 인쇄할 수 있는 권리\n`;
    if (rights.distribution) content += `   - 배포권: 작품을 판매, 배포할 수 있는 권리\n`;
    if (rights.publicPerformance) content += `   - 공연권: 작품을 공개 공연할 수 있는 권리\n`;
    if (rights.publicTransmission) content += `   - 공중송신권: 방송, 인터넷 전송할 수 있는 권리\n`;
    if (rights.exhibition) content += `   - 전시권: 작품을 전시할 수 있는 권리\n`;
    if (rights.rental) content += `   - 대여권: 작품을 대여할 수 있는 권리\n`;
    content += `\n`;

    // 이용 범위
    if (copyright.usagePeriod || copyright.usageRegion || copyright.usageMedia) {
      content += `⑤ 권리 행사의 범위:\n`;
      if (copyright.usagePeriod) {
        if (copyright.usagePeriod.perpetual) {
          content += `   - 사용 기간: **무기한**\n`;
        } else {
          content += `   - 사용 기간: ${formatDate(copyright.usagePeriod.start)} ~ ${formatDate(copyright.usagePeriod.end)}\n`;
        }
      }
      if (copyright.usageRegion) {
        content += `   - 사용 지역: ${copyright.usageRegion}\n`;
      }
      if (copyright.usageMedia && copyright.usageMedia.length > 0) {
        content += `   - 사용 매체: ${copyright.usageMedia.join(', ')}\n`;
      }
      content += `\n`;
    }

    content += `⑥ 본 조에서 정하지 않은 권리는 모두 을에게 유보된다.\n\n`;
  } else {
    // 기본 권리 조항
    const scopeKor = formData.usageScope?.map(s => {
      const map: any = {
        'personal': '개인적 사용',
        'commercial': '상업적 사용',
        'online': '온라인 사용',
        'print': '인쇄물 사용',
        'unlimited': '무제한 사용',
      };
      return map[s] || s;
    }).join(', ') || '[사용 범위 미정]';

    content += `① 본 저작물의 저작재산권은 갑에게 양도한다.\n\n`;
    content += `② **저작인격권은 을에게 유보되며 양도할 수 없다.**\n\n`;
    content += `③ 사용 범위: **${scopeKor}**\n\n`;
    content += `④ 본 조에서 정하지 않은 권리는 을에게 유보된다.\n\n`;
  }

  content += `---\n\n`;
  return content;
}

// 제8조: 크레딧 명기
function generateArticle8_CreditAttribution(formData: EnhancedContractFormData): string {
  const credit = formData.protectionClauses?.creditAttribution;

  let content = `## 제8조 (크레딧 명기)\n\n`;

  if (credit) {
    const positionKor = {
      'start': '시작 부분',
      'end': '종료 부분',
      'separate_credit': '별도 크레딧',
    }[credit.displayPosition];

    content += `① 갑은 최종 결과물에 을의 성명을 다음과 같이 표시한다:\n\n`;
    content += `   - 표시 내용: "${credit.displayContent}"\n`;
    content += `   - 표시 위치: ${positionKor}\n`;
    content += `   - 표시 방법: ${credit.displayMethod === 'text' ? '텍스트' : credit.displayMethod === 'image' ? '이미지' : '텍스트 및 이미지'}\n\n`;

    if (credit.onlineDisplay) {
      content += `② 온라인에 게시하는 경우에도 동일하게 크레딧을 표시한다.\n\n`;
    }

    if (credit.penaltyForOmission) {
      content += `③ 크레딧 표시를 누락한 경우, 별도로 손해배상을 청구할 수 있다.\n\n`;
    }
  } else {
    // 기본 크레딧 조항
    const fieldName = getFieldName(formData.field);
    content += `① 갑은 최종 결과물에 을의 성명과 역할을 표시한다.\n\n`;
    content += `   - 표시 예: "${fieldName} 작업: ${formData.artistName || '[창작자명]'}"\n\n`;
    content += `② 온라인 게시 시에도 동일하게 표시한다.\n\n`;
  }

  content += `---\n\n`;
  return content;
}

// 제9조: 수정 및 변경
function generateArticle9_Modifications(formData: EnhancedContractFormData): string {
  const modTerms = formData.protectionClauses?.modificationRights;

  let content = `## 제9조 (수정 및 변경)\n\n`;

  if (modTerms) {
    content += `① 갑은 계약 범위 내에서 다음과 같이 수정을 요구할 수 있다:\n\n`;
    content += `   - 경미한 수정: ${modTerms.minorModifications.free ? '무상' : '유상'} ${modTerms.minorModifications.count}회\n`;
    content += `   - 추가 수정: 회당 ${formatCurrency(modTerms.additionalModifications.pricePerModification)}\n`;
    if (modTerms.substantialChanges.requiresConsent) {
      content += `   - 본질적 변경: 을의 서면 동의 필요\n\n`;
    }

    if (modTerms.substantialChanges.definition.length > 0) {
      content += `② 다음은 본질적 변경으로 보아 을의 동의를 받아야 한다:\n`;
      modTerms.substantialChanges.definition.forEach(def => {
        content += `   - ${def}\n`;
      });
      content += `\n`;
    }

    content += `③ 을의 서면 동의 없이 본질적 변경을 한 경우, 저작인격권 침해로 보며\n`;
    content += `   을은 계약을 해제하고 손해배상을 청구할 수 있다. (저작권법 제13조)\n\n`;
  } else if (formData.revisions !== undefined) {
    // 기본 수정 조항
    const revisionCount = formData.revisions === 'unlimited' ? '무제한 ⚠️' : formData.revisions;
    content += `① 갑은 **${revisionCount}회**의 수정을 요구할 수 있다.\n\n`;

    if (formData.additionalRevisionFee) {
      content += `② 추가 수정 시 회당 ${formatCurrency(formData.additionalRevisionFee)}의 비용이 발생한다.\n\n`;
    }

    content += `③ 작품의 본질적 변경은 을의 동의를 받아야 하며, 동의 없는 변경은 저작인격권 침해로 본다.\n\n`;
  }

  content += `---\n\n`;
  return content;
}

// 제10조: 계약의 해제 및 해지
function generateArticle10_Termination(formData: EnhancedContractFormData): string {
  const termination = formData.terminationTerms;

  let content = `## 제10조 (계약의 해제 및 해지)\n\n`;

  content += `① 다음의 경우 계약을 해제할 수 있다:\n`;
  content += `   1. 천재지변, 전쟁, 전염병 등 불가항력 사유\n`;
  content += `   2. 당사자의 합의\n`;
  content += `   3. 상대방의 계약 위반\n\n`;

  if (termination) {
    content += `② 계약 위반 시 해제 절차:\n`;
    content += `   1단계: 위반 사실을 서면으로 통지\n`;
    content += `   2단계: ${termination.breachTermination.remedyPeriod}일의 시정 기간 부여\n`;
    content += `   3단계: 시정되지 않으면 계약 해제\n\n`;

    if (termination.immediateTermination.length > 0) {
      content += `③ 다음의 경우 즉시 해제할 수 있다:\n`;
      termination.immediateTermination.forEach(reason => {
        content += `   - ${reason}\n`;
      });
      content += `\n`;
    }
  } else {
    content += `② 계약 위반 시 15일의 시정 기간을 부여한 후 해제할 수 있다.\n\n`;
  }

  content += `④ 계약 해제 시:\n`;
  content += `   - 기 지급된 대금은 작업 진척도에 따라 정산\n`;
  content += `   - 완성된 부분에 대한 권리는 별도 협의\n`;
  content += `   - 손해배상 청구권은 별도\n\n`;

  content += `---\n\n`;
  return content;
}

// 제11조: 비밀유지
function generateArticle11_Confidentiality(formData: EnhancedContractFormData): string {
  const conf = formData.protectionClauses?.confidentiality;

  let content = `## 제11조 (비밀유지)\n\n`;

  if (conf) {
    content += `① 당사자는 다음 정보를 제3자에게 공개하거나 누설하지 않는다:\n`;
    conf.scope.forEach(item => {
      content += `   - ${item}\n`;
    });
    content += `\n`;

    content += `② 비밀유지 의무는 계약 종료 후 ${conf.duration}년간 유지된다.\n\n`;

    if (conf.exceptions.length > 0) {
      content += `③ 다음의 경우는 비밀유지 의무에서 제외된다:\n`;
      conf.exceptions.forEach(ex => {
        content += `   - ${ex}\n`;
      });
      content += `\n`;
    }
  } else {
    content += `① 당사자는 본 계약의 내용 및 작업 과정에서 알게 된 정보를 제3자에게 누설하지 않는다.\n\n`;
    content += `② 비밀유지 의무는 계약 종료 후 2년간 유지된다.\n\n`;
  }

  content += `③ 위반 시 손해배상 책임을 진다.\n\n`;

  content += `---\n\n`;
  return content;
}

// 제12조: 분쟁의 해결
function generateArticle12_DisputeResolution(formData: EnhancedContractFormData): string {
  const dispute = formData.disputeResolution;

  let content = `## 제12조 (분쟁의 해결)\n\n`;

  content += `① 본 계약과 관련한 분쟁은 다음 절차에 따라 해결한다:\n\n`;

  content += `   **1단계: 자율적 협의**\n`;
  if (dispute) {
    content += `   - 분쟁 발생 시 당사자는 신의성실 원칙에 따라 협의한다.\n`;
    content += `   - 협의 기간: 통지 후 ${dispute.negotiationPeriod}일\n\n`;
  } else {
    content += `   - 분쟁 발생 시 당사자는 신의성실 원칙에 따라 협의한다.\n`;
    content += `   - 협의 기간: 통지 후 30일\n\n`;
  }

  content += `   **2단계: 조정**\n`;
  content += `   - 협의가 실패한 경우 다음 기관에 조정을 신청한다:\n`;

  if (dispute && dispute.mediationOrganizations.length > 0) {
    dispute.mediationOrganizations.forEach(org => {
      content += `     • ${org}\n`;
    });
  } else {
    content += `     • 한국저작권위원회 (www.copyright.or.kr)\n`;
    content += `     • 콘텐츠분쟁조정위원회\n`;
    content += `     • 예술인 신문고 (1899-2202)\n`;
  }
  content += `\n`;

  content += `   **3단계: 소송**\n`;
  content += `   - 조정이 실패한 경우 법원에 제소할 수 있다.\n`;

  if (dispute) {
    content += `   - 관할 법원: ${dispute.jurisdiction}\n\n`;
  } else {
    const jurisdiction = formData.clientType === 'enterprise' ? '서울중앙지방법원' : '피고 주소지 관할 법원';
    content += `   - 관할 법원: ${jurisdiction}\n\n`;
  }

  content += `② 조정이 성립한 경우 재판상 화해와 동일한 효력을 가진다.\n\n`;

  content += `---\n\n`;
  return content;
}

// 제13조: 효력 발생
function generateArticle13_Effectiveness(formData: EnhancedContractFormData): string {
  return `## 제13조 (효력 발생)

본 계약은 계약서 2부를 작성하여 당사자가 서명 날인한 후 각 1부씩 보관하며,
서명 날인한 날부터 효력이 발생한다.

---

`;
}

// 서명란
function generateSignatureSection(formData: EnhancedContractFormData | ContractFormData): string {
  const today = formatDate(new Date());

  let content = `## 서명\n\n`;
  content += `**${today}**\n\n`;

  content += `**갑 (의뢰인)**\n\n`;
  content += `- 성명: ${formData.clientName || '______________'} (인)\n`;
  if (formData.clientContact) {
    content += `- 연락처: ${formData.clientContact}\n`;
  }
  content += `\n`;

  content += `**을 (창작자)**\n\n`;
  content += `- 성명: ${formData.artistName || '______________'} (인)\n`;
  if (formData.artistContact) {
    content += `- 연락처: ${formData.artistContact}\n`;
  }
  if (formData.artistIdNumber) {
    content += `- 주민등록번호(뒷자리) 또는 사업자번호: ${formData.artistIdNumber}\n`;
  }
  if (formData.artistAddress) {
    content += `- 주소: ${formData.artistAddress}\n`;
  }
  content += `\n`;

  return content;
}

// ========== 기존 간단한 계약서 생성 (하위 호환성) ==========

function generateBasicContract(formData: ContractFormData, template: ContractTemplate): string {
  let content = `# ${template.name}\n\n`;
  content += `생성일: ${formatDate(new Date())}\n\n`;
  content += `---\n\n`;

  const sortedSections = Object.entries(template.sections)
    .sort(([, a], [, b]) => a.order - b.order);

  sortedSections.forEach(([key, section]) => {
    content += `## ${section.title}\n\n`;
    let sectionContent = replaceVariables(section.template, formData);
    content += `${sectionContent}\n\n`;
  });

  content += `---\n\n`;
  content += `## 법적 고지\n\n`;
  content += `${template.legal_disclaimer}\n\n`;

  content += `---\n\n`;
  content += generateSignatureSection(formData);

  return content;
}

function replaceVariables(template: string, data: ContractFormData): string {
  let result = template;

  result = result.replace(/{client_name}/g, data.clientName || '[클라이언트 이름 미정]');
  result = result.replace(/{client_contact}/g, data.clientContact || '[연락처 미정]');
  result = result.replace(/{artist_name}/g, data.artistName || '[예술가 이름 미정]');
  result = result.replace(/{artist_contact}/g, data.artistContact || '[예술가 연락처 미정]');
  result = result.replace(/{artist_id}/g, data.artistIdNumber || '[미정]');
  result = result.replace(/{artist_address}/g, data.artistAddress || '[미정]');
  result = result.replace(/{work_type}/g, data.workType || data.workDescription || '[작업 내용 미정]');
  result = result.replace(/{work_description}/g, data.workDescription || '[상세 설명 미정]');

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

  if (data.payment?.amount) {
    result = result.replace(/{amount}/g, formatCurrency(data.payment.amount));

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

  return result;
}

// ========== Helper Functions ==========

function getFieldName(field?: string): string {
  const map: any = {
    'design': '디자인/일러스트',
    'photography': '사진/영상',
    'writing': '글쓰기',
    'music': '음악',
    'video': '영상',
    'voice': '성우/더빙',
    'translation': '번역',
    'other': '기타 창작',
  };
  return map[field || 'other'] || '창작';
}

function get납품형태(formData: EnhancedContractFormData): string {
  const field = formData.field;

  const formats: any = {
    'design': 'JPG, PNG, PDF 등 디지털 파일',
    'photography': '보정본 JPG 및 원본 RAW 파일',
    'writing': 'DOCX 또는 HWP 문서',
    'music': 'MP3, WAV 등 음원 파일',
    'video': 'MP4, MOV 등 영상 파일',
    'voice': 'MP3, WAV 등 음원 파일',
    'translation': 'DOCX 또는 HWP 문서',
  };

  return formats[field || 'other'] || '디지털 파일 또는 인쇄물';
}

export function exportToText(contract: GeneratedContract): string {
  return contract.content;
}

export function exportToMarkdown(contract: GeneratedContract): string {
  return contract.content;
}
