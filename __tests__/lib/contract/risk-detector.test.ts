import { detectContractRisks } from '@/lib/contract/risk-detector';
import { ContractFormData, EnhancedContractFormData } from '@/types/contract';

describe('detectContractRisks', () => {
  describe('금액 관련 위험 감지', () => {
    test('금액이 0원인 경우 zero_payment 경고 발생', () => {
      const formData: ContractFormData = {
        field: 'design',
        payment: { amount: 0, currency: 'KRW' },
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'zero_payment',
          severity: 'danger',
        })
      );
    });

    test('0원 항목도 합계에 포함되어 금액 불일치 경고 없음', () => {
      const formData: ContractFormData = {
        field: 'music',
        workItems: [
          { id: 'free', title: '무료 제공', subtotal: 0 },
          { id: 'paid', title: '작곡', unitPrice: 500000, quantity: 1 },
        ],
        payment: { amount: 500000, currency: 'KRW' },
        revisions: 3,
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).not.toContainEqual(
        expect.objectContaining({ id: 'work_items_amount_mismatch' })
      );
    });


    test('항목 합계와 총액 차이가 10만원 이상이면 경고', () => {
      const formData: ContractFormData = {
        field: 'music',
        workItems: [
          { id: 'compose', title: '작곡', subtotal: 300000 },
        ],
        payment: { amount: 100000, currency: 'KRW' },
        revisions: 3,
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({ id: 'work_items_amount_mismatch' })
      );
    });
    test('금액이 5만원 미만인 경우 극저가 경고', () => {
      const formData: ContractFormData = {
        field: 'design',
        payment: { amount: 30000, currency: 'KRW' },
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'very_low_payment',
          severity: 'danger',
        })
      );
    });

    test('금액이 100만원 이상인 경우 법률 상담 권장', () => {
      const formData: ContractFormData = {
        field: 'design',
        payment: { amount: 1500000, currency: 'KRW' },
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'high_value_legal_consult',
          severity: 'info',
        })
      );
    });

    test('10만원 이상 계약에 계약금 없으면 경고', () => {
      const formData: ContractFormData = {
        field: 'design',
        payment: { amount: 500000, currency: 'KRW' },
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'no_down_payment',
          severity: 'warning',
        })
      );
    });

    test('금액이 없는 경우 danger 경고', () => {
      const formData: ContractFormData = {
        field: 'design',
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'no_payment',
          severity: 'danger',
        })
      );
    });
  });

  describe('수정 횟수 관련 위험 감지', () => {
    test('무제한 수정은 danger 경고', () => {
      const formData: ContractFormData = {
        field: 'design',
        revisions: 'unlimited',
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'unlimited_revisions',
          severity: 'danger',
        })
      );
    });

    test('수정 0회는 warning 경고', () => {
      const formData: ContractFormData = {
        field: 'design',
        revisions: 0,
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'zero_revisions',
          severity: 'warning',
        })
      );
    });

    test('수정 10회 이상은 과다 경고', () => {
      const formData: ContractFormData = {
        field: 'design',
        revisions: 15,
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'too_many_revisions',
          severity: 'warning',
        })
      );
    });

    test('수정 2-5회는 정상 범위', () => {
      const formData: ContractFormData = {
        field: 'design',
        revisions: 3,
        payment: { amount: 500000, currency: 'KRW' },
      };

      const result = detectContractRisks(formData);

      const revisionWarnings = result.warnings.filter(
        w => w.id === 'unlimited_revisions' || w.id === 'zero_revisions' || w.id === 'too_many_revisions'
      );
      expect(revisionWarnings).toHaveLength(0);
    });
  });

  describe('마감일 관련 위험 감지', () => {
    test('당일 마감은 러시 작업 경고', () => {
      const today = new Date();
      const formData: ContractFormData = {
        field: 'design',
        timeline: { deadline: today },
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'rush_deadline',
          severity: 'danger',
        })
      );
    });

    test('일주일 이내 마감은 촉박 경고', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 5);
      const formData: ContractFormData = {
        field: 'design',
        timeline: { deadline: nextWeek },
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'tight_deadline',
          severity: 'warning',
        })
      );
    });

    test('30일 이상 장기 프로젝트는 info', () => {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 40);
      const formData: ContractFormData = {
        field: 'design',
        timeline: { deadline: nextMonth },
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'long_term_project',
          severity: 'info',
        })
      );
    });
  });

  describe('저작권 관련 치명적 오류 감지', () => {
    test('저작인격권 양도 시도 시 critical 오류', () => {
      const formData: EnhancedContractFormData = {
        field: 'design',
        copyrightTerms: {
          rightsType: 'full_transfer',
          moralRights: {
            attribution: false, // 성명표시권 양도 시도
            integrity: true,
            disclosure: true,
          },
          economicRights: {
            reproduction: true,
            distribution: true,
            publicPerformance: false,
            publicTransmission: false,
            exhibition: false,
            rental: false,
          },
          derivativeWorks: {
            included: false,
            separateNegotiation: true,
          },
        },
      };

      const result = detectContractRisks(formData);

      expect(result.criticalErrors).toContain('저작인격권은 법적으로 양도할 수 없습니다!');
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'moral_rights_transfer',
          severity: 'danger',
        })
      );
    });

    test('2차적저작물권 무상 포함 시 danger 경고', () => {
      const formData: EnhancedContractFormData = {
        field: 'design',
        copyrightTerms: {
          rightsType: 'full_transfer',
          moralRights: {
            attribution: true,
            integrity: true,
            disclosure: true,
          },
          economicRights: {
            reproduction: true,
            distribution: true,
            publicPerformance: false,
            publicTransmission: false,
            exhibition: false,
            rental: false,
          },
          derivativeWorks: {
            included: true,
            separateNegotiation: false,
            additionalFee: undefined, // 무상 포함
          },
        },
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'derivative_works_no_fee',
          severity: 'danger',
        })
      );
    });

    test('전부 양도 + 저가 계약 경고', () => {
      const formData: EnhancedContractFormData = {
        field: 'design',
        payment: { amount: 500000, currency: 'KRW' },
        copyrightTerms: {
          rightsType: 'full_transfer',
          moralRights: {
            attribution: true,
            integrity: true,
            disclosure: true,
          },
          economicRights: {
            reproduction: true,
            distribution: true,
            publicPerformance: true,
            publicTransmission: true,
            exhibition: true,
            rental: true,
          },
          derivativeWorks: {
            included: false,
            separateNegotiation: true,
          },
        },
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'full_transfer_low_price',
          severity: 'danger',
        })
      );
    });
  });

  describe('사용 범위 관련', () => {
    test('사용 범위 미정 경고', () => {
      const formData: ContractFormData = {
        field: 'design',
        usageScope: [],
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'no_usage_scope',
          severity: 'warning',
        })
      );
    });

    test('무제한 사용 범위 경고', () => {
      const formData: ContractFormData = {
        field: 'design',
        usageScope: ['unlimited'],
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'unlimited_usage',
          severity: 'warning',
        })
      );
    });
  });

  describe('클라이언트 정보', () => {
    test('클라이언트 이름 없으면 경고', () => {
      const formData: ContractFormData = {
        field: 'design',
      };

      const result = detectContractRisks(formData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          id: 'no_client_info',
          severity: 'warning',
        })
      );
    });
  });

  describe('위험 레벨 계산', () => {
    test('치명적 오류가 있으면 high 이상', () => {
      const formData: ContractFormData = {
        field: 'design',
        payment: { amount: 0, currency: 'KRW' },
      };

      const result = detectContractRisks(formData);

      expect(['high', 'critical']).toContain(result.riskLevel);
    });

    test('danger 경고 2개 이상이면 critical', () => {
      const formData: ContractFormData = {
        field: 'design',
        revisions: 'unlimited',
        payment: { amount: 30000, currency: 'KRW' },
      };

      const result = detectContractRisks(formData);

      expect(result.riskLevel).toBe('critical');
    });

    test('danger 경고 1개면 high', () => {
      const formData: ContractFormData = {
        field: 'design',
        revisions: 'unlimited',
        payment: { amount: 500000, currency: 'KRW' },
      };

      const result = detectContractRisks(formData);

      expect(result.riskLevel).toBe('high');
    });

    test('warning 경고 2개 이상이면 medium', () => {
      const formData: ContractFormData = {
        field: 'design',
        revisions: 0,
        usageScope: [],
        payment: { amount: 500000, currency: 'KRW' },
      };

      const result = detectContractRisks(formData);

      expect(result.riskLevel).toBe('medium');
    });

    test('문제 없으면 low', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 10);

      const formData: ContractFormData = {
        field: 'design',
        clientName: 'Test Client',
        revisions: 3,
        usageScope: ['commercial'],
        payment: { amount: 500000, currency: 'KRW', deposit: 150000 },
        timeline: { deadline: nextWeek },
      };

      const result = detectContractRisks(formData);

      expect(result.riskLevel).toBe('low');
    });
  });

  describe('완성도 계산', () => {
    test('필수 필드가 모두 채워지면 높은 완성도', () => {
      const formData: ContractFormData = {
        field: 'design',
        workType: '로고 디자인',
        clientName: 'Test Client',
        revisions: 3,
        usageScope: ['commercial'],
        payment: { amount: 500000, currency: 'KRW' },
        timeline: { deadline: new Date() },
      };

      const result = detectContractRisks(formData);

      expect(result.completeness).toBeGreaterThanOrEqual(80);
    });

    test('필수 필드가 비어있으면 낮은 완성도', () => {
      const formData: ContractFormData = {
        field: 'design',
      };

      const result = detectContractRisks(formData);

      expect(result.completeness).toBeLessThan(50);
    });
  });
});
