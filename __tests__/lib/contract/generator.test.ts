import { generateContract } from '@/lib/contract/generator';
import { ContractFormData, EnhancedContractFormData, ContractTemplate } from '@/types/contract';

// Mock template for testing
const mockTemplate: ContractTemplate = {
  id: 'test_template',
  name: '테스트 계약서',
  field: 'design',
  sections: {
    intro: {
      title: '계약 당사자',
      template: '의뢰인: {client_name}\n창작자: {artist_name}',
      order: 1,
      required: true,
    },
    work: {
      title: '작업 내용',
      template: '작업: {work_type}\n설명: {work_description}',
      order: 2,
      required: true,
    },
    payment: {
      title: '대금',
      template: '총 금액: {amount}\n지급 일정: {payment_schedule}',
      order: 3,
      required: true,
    },
    revisions: {
      title: '수정',
      template: '수정 횟수: {revisions}회',
      order: 4,
      required: true,
    },
  },
  legal_disclaimer: '본 계약서는 법률 자문을 대체하지 않습니다.',
};

describe('generateContract', () => {
  describe('Basic Contract Generation (하위 호환성)', () => {
    test('기본 정보로 간단한 계약서 생성', () => {
      const formData: ContractFormData = {
        field: 'design',
        workType: '로고 디자인',
        workDescription: '회사 로고 제작',
        clientName: 'ABC 회사',
        artistName: '홍길동',
        payment: {
          amount: 500000,
          currency: 'KRW',
        },
        revisions: 3,
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.content).toContain('의뢰인: ABC 회사');
      expect(result.content).toContain('창작자: 홍길동');
      expect(result.content).toContain('작업: 로고 디자인');
      expect(result.content).toContain('설명: 회사 로고 제작');
      expect(result.content).toContain('500,000');
      expect(result.content).toContain('수정 횟수: 3회');
    });

    test('여러 작업 항목이 요약에 포함된다', () => {
      const formData: ContractFormData = {
        field: 'music',
        workItems: [
          { id: 'compose', title: '작곡', description: '메인 테마 작곡', quantity: 1, unitPrice: 300000 },
          { id: 'mix', title: '믹싱', description: '트랙 믹싱', quantity: 1, unitPrice: 200000 },
        ],
        payment: {
          amount: 550000,
          currency: 'KRW',
        },
        revisions: 2,
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.content).toContain('작업: 작곡');
      expect(result.content).toContain('1. 작곡');
      expect(result.content).toContain('2. 믹싱');
      expect(result.content).toContain('메인 테마 작곡');
      expect(result.content).toContain('트랙 믹싱');
    });

    test('미정 필드는 [미정] 텍스트로 표시', () => {
      const formData: ContractFormData = {
        field: 'design',
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.content).toContain('[클라이언트 이름 미정]');
      expect(result.content).toContain('[예술가 이름 미정]');
      expect(result.content).toContain('[상세 설명 미정]');
      expect(result.content).toContain('[금액 미정]');
    });

    test('계약금이 있으면 계약금/잔금 분할 표시', () => {
      const formData: ContractFormData = {
        field: 'design',
        payment: {
          amount: 1000000,
          currency: 'KRW',
          deposit: 300000,
        },
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.content).toContain('계약금');
      expect(result.content).toContain('300,000');
      expect(result.content).toContain('잔금');
      expect(result.content).toContain('700,000');
    });

    test('무제한 수정은 경고와 함께 표시', () => {
      const formData: ContractFormData = {
        field: 'design',
        revisions: 'unlimited',
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.content).toContain('무제한');
      expect(result.content).toContain('⚠️');
    });
  });

  describe('Enhanced Contract Generation (표준계약서)', () => {
    test('저작권 조항이 있으면 표준계약서 생성', () => {
      const formData: EnhancedContractFormData = {
        field: 'design',
        workType: '일러스트 제작',
        clientName: 'XYZ 출판사',
        artistName: '김작가',
        payment: {
          amount: 2000000,
          currency: 'KRW',
        },
        copyrightTerms: {
          rightsType: 'exclusive_license',
          moralRights: {
            attribution: true,
            integrity: true,
            disclosure: true,
          },
          economicRights: {
            reproduction: true,
            distribution: true,
            publicPerformance: false,
            publicTransmission: true,
            exhibition: false,
            rental: false,
          },
          derivativeWorks: {
            included: false,
            separateNegotiation: true,
          },
        },
      };

      const result = generateContract(formData, mockTemplate);

      // 표준계약서 주요 조항 확인
      expect(result.content).toContain('제1조');
      expect(result.content).toContain('제2조');
      expect(result.content).toContain('제7조 (권리의 귀속)');
      expect(result.content).toContain('저작인격권');
      expect(result.content).toContain('독점적 이용허락');
    });

    test('저작인격권은 항상 창작자에게 귀속 표시', () => {
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
            included: false,
            separateNegotiation: true,
          },
        },
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.content).toContain('저작인격권은 을에게 유보되며');
      expect(result.content).toContain('양도될 수 없다');
      expect(result.content).toContain('성명표시권');
      expect(result.content).toContain('동일성유지권');
      expect(result.content).toContain('공표권');
    });

    test('2차적저작물권 별도 협의 시 명시', () => {
      const formData: EnhancedContractFormData = {
        field: 'design',
        copyrightTerms: {
          rightsType: 'partial_transfer',
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
            included: false,
            separateNegotiation: true,
          },
        },
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.content).toContain('2차적저작물작성권');
      expect(result.content).toContain('별도의 협의');
    });

    test('enhancedPayment로 분할 지급 표시', () => {
      const formData: EnhancedContractFormData = {
        field: 'design',
        enhancedPayment: {
          totalAmount: 3000000,
          installments: {
            downPayment: {
              amount: 900000,
              percentage: 30,
            },
            midPayment: {
              amount: 900000,
              percentage: 30,
              milestone: '초안 완성 시',
            },
            finalPayment: {
              amount: 1200000,
              percentage: 40,
              dueDate: 7,
            },
          },
          bankAccount: {
            bank: '국민은행',
            accountNumber: '123-456-789',
            accountHolder: '김작가',
          },
        },
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.content).toContain('3,000,000');
      expect(result.content).toContain('계약금');
      expect(result.content).toContain('30%');
      expect(result.content).toContain('900,000');
      expect(result.content).toContain('중도금');
      expect(result.content).toContain('초안 완성 시');
      expect(result.content).toContain('잔금');
      expect(result.content).toContain('1,200,000');
      expect(result.content).toContain('국민은행');
      expect(result.content).toContain('123-456-789');
    });

    test('크레딧 조항 포함', () => {
      const formData: EnhancedContractFormData = {
        field: 'design',
        artistName: '이디자이너',
        protectionClauses: {
          creditAttribution: {
            displayContent: 'Design by 이디자이너',
            displayPosition: 'end',
            displayMethod: 'text',
            onlineDisplay: true,
            penaltyForOmission: true,
          },
        },
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.content).toContain('제8조 (크레딧 명기)');
      expect(result.content).toContain('Design by 이디자이너');
      expect(result.content).toContain('종료 부분');
    });

    test('수정 및 변경 조항', () => {
      const formData: EnhancedContractFormData = {
        field: 'design',
        protectionClauses: {
          modificationRights: {
            minorModifications: {
              count: 3,
              free: true,
            },
            additionalModifications: {
              allowed: true,
              pricePerModification: 50000,
            },
            substantialChanges: {
              requiresConsent: true,
              definition: ['컨셉 변경', '스타일 변경'],
            },
          },
        },
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.content).toContain('제9조 (수정 및 변경)');
      expect(result.content).toContain('3회');
      expect(result.content).toContain('50,000');
      expect(result.content).toContain('컨셉 변경');
      expect(result.content).toContain('본질적 변경');
    });
  });

  describe('Contract Metadata', () => {
    test('생성된 계약서에 메타데이터 포함', () => {
      const formData: ContractFormData = {
        field: 'design',
        completeness: 75,
        warnings: [
          {
            id: 'test_warning',
            severity: 'warning',
            message: 'Test warning',
            autoTrigger: true,
            dismissible: true,
          },
        ],
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.id).toMatch(/^contract_\d+$/);
      expect(result.formData).toEqual(formData);
      expect(result.template).toEqual(mockTemplate);
      expect(result.completeness).toBe(75);
      expect(result.warnings).toHaveLength(1);
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Legal Disclaimer', () => {
    test('모든 계약서에 법적 면책 조항 포함', () => {
      const basicFormData: ContractFormData = {
        field: 'design',
      };

      const enhancedFormData: EnhancedContractFormData = {
        field: 'design',
        copyrightTerms: {
          rightsType: 'exclusive_license',
          moralRights: {
            attribution: true,
            integrity: true,
            disclosure: true,
          },
          economicRights: {
            reproduction: true,
            distribution: false,
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

      const basicResult = generateContract(basicFormData, mockTemplate);
      const enhancedResult = generateContract(enhancedFormData, mockTemplate);

      expect(basicResult.content).toContain('법적 고지');
      expect(basicResult.content).toContain('법률 자문을 대체하지 않습니다');
      expect(enhancedResult.content).toContain('법적 고지');
      expect(enhancedResult.content).toContain('법률 자문을 대체하지 않습니다');
    });
  });

  describe('Signature Section', () => {
    test('서명란에 당사자 정보 포함', () => {
      const formData: ContractFormData = {
        field: 'design',
        clientName: 'ABC 회사',
        clientContact: '010-1234-5678',
        artistName: '홍길동',
        artistContact: '010-9876-5432',
        artistIdNumber: '123456-1234567',
        artistAddress: '서울시 강남구',
      };

      const result = generateContract(formData, mockTemplate);

      expect(result.content).toContain('서명');
      expect(result.content).toContain('ABC 회사');
      expect(result.content).toContain('010-1234-5678');
      expect(result.content).toContain('홍길동');
      expect(result.content).toContain('010-9876-5432');
      expect(result.content).toContain('123456-1234567');
      expect(result.content).toContain('서울시 강남구');
    });
  });
});
