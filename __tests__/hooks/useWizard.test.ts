import { renderHook, act } from '@testing-library/react';
import { useWizard } from '@/hooks/useWizard';

describe('useWizard', () => {
  describe('초기 상태', () => {
    test('Step 0에서 시작', () => {
      const { result } = renderHook(() => useWizard());

      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.canGoNext).toBe(false); // 작가 정보 미입력
      expect(result.current.canGoPrev).toBe(false);
      expect(result.current.completeness).toBe(0);
      expect(result.current.totalSteps).toBe(11);
    });

    test('visitedSteps에 Step 0 포함', () => {
      const { result } = renderHook(() => useWizard());

      expect(result.current.visitedSteps).toEqual([0]);
    });
  });

  describe('단계 이동', () => {
    test('nextStep으로 다음 단계 이동', () => {
      const { result } = renderHook(() => useWizard());

      // Step 0에서 작가 정보 입력
      act(() => {
        result.current.updateFormData({
          artistName: '홍길동',
          artistContact: '010-1234-5678',
        });
      });

      expect(result.current.canGoNext).toBe(true);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.canGoPrev).toBe(true);
      expect(result.current.visitedSteps).toContain(1);
    });

    test('prevStep으로 이전 단계 이동', () => {
      const { result } = renderHook(() => useWizard());

      // Step 1로 이동
      act(() => {
        result.current.updateFormData({
          artistName: '홍길동',
          artistContact: '010-1234-5678',
        });
        result.current.nextStep();
        result.current.nextStep(); // Step 2로
      });

      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    test('goToStep으로 특정 단계 이동', () => {
      const { result } = renderHook(() => useWizard());

      act(() => {
        result.current.goToStep(5);
      });

      expect(result.current.currentStep).toBe(5);
      expect(result.current.visitedSteps).toContain(5);
    });

    test('최대 단계 도달 시 isComplete 설정', () => {
      const { result } = renderHook(() => useWizard());

      // Step 10까지 이동
      act(() => {
        result.current.goToStep(10);
      });

      expect(result.current.currentStep).toBe(10);
      expect(result.current.isComplete).toBe(false);

      // Step 11로 이동 (마지막 단계)
      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(11);
      expect(result.current.isComplete).toBe(true);
    });

    test('Step 0 이하로 이동 불가', () => {
      const { result } = renderHook(() => useWizard());

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(0); // 변화 없음
    });
  });

  describe('폼 데이터 업데이트', () => {
    test('updateFormData로 데이터 저장', () => {
      const { result } = renderHook(() => useWizard());

      act(() => {
        result.current.updateFormData({
          field: 'design',
          clientName: 'ABC 회사',
        });
      });

      expect(result.current.formData.field).toBe('design');
      expect(result.current.formData.clientName).toBe('ABC 회사');
    });

    test('부분 업데이트 가능', () => {
      const { result } = renderHook(() => useWizard());

      act(() => {
        result.current.updateFormData({
          field: 'design',
        });
      });

      expect(result.current.formData.field).toBe('design');

      act(() => {
        result.current.updateFormData({
          clientName: 'XYZ 회사',
        });
      });

      expect(result.current.formData.field).toBe('design'); // 유지
      expect(result.current.formData.clientName).toBe('XYZ 회사'); // 추가
    });
  });

  describe('canGoNext 계산', () => {
    test('Step 0: 작가 이름과 연락처 필수', () => {
      const { result } = renderHook(() => useWizard());

      expect(result.current.canGoNext).toBe(false);

      act(() => {
        result.current.updateFormData({
          artistName: '홍길동',
        });
      });

      expect(result.current.canGoNext).toBe(false); // 연락처 아직 없음

      act(() => {
        result.current.updateFormData({
          artistContact: '010-1234-5678',
        });
      });

      expect(result.current.canGoNext).toBe(true);
    });

    test('Step 2: workItems가 있으면 통과', () => {
      const { result } = renderHook(() => useWizard());

      act(() => {
        result.current.goToStep(2);
      });

      act(() => {
        result.current.updateFormData({
          workItems: [
            {
              id: 'item_1',
              title: '작곡',
              description: '기본 테마 작곡',
              quantity: 1,
            },
          ],
        });
      });

      expect(result.current.canGoNext).toBe(true);
    });

    test('Step 9: 보호 조항 선택사항, 항상 통과', () => {
      const { result } = renderHook(() => useWizard());

      act(() => {
        result.current.goToStep(9);
      });

      expect(result.current.canGoNext).toBe(true);
    });

    test('Step 10: 최종 확인, 항상 통과', () => {
      const { result } = renderHook(() => useWizard());

      act(() => {
        result.current.goToStep(10);
      });

      expect(result.current.canGoNext).toBe(true);
    });
  });

  describe('위험 감지 시스템 통합', () => {
    test('무제한 수정 시 danger 경고 발생', () => {
      const { result } = renderHook(() => useWizard());

      act(() => {
        result.current.updateFormData({
          revisions: 'unlimited',
        });
      });

      expect(result.current.formData.riskLevel).toBe('high');
      expect(result.current.formData.warnings).toContainEqual(
        expect.objectContaining({
          id: 'unlimited_revisions',
          severity: 'danger',
        })
      );
    });

    test('0원 금액 시 high 위험', () => {
      const { result } = renderHook(() => useWizard());

      act(() => {
        result.current.updateFormData({
          payment: {
            amount: 0,
            currency: 'KRW',
          },
        });
      });

      expect(result.current.formData.riskLevel).toBe('high');
      expect(result.current.formData.warnings).toContainEqual(
        expect.objectContaining({
          id: 'no_payment',
          severity: 'danger',
        })
      );
    });

    test('안전한 계약서는 low 위험', () => {
      const { result } = renderHook(() => useWizard());

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 10);

      act(() => {
        result.current.updateFormData({
          field: 'design',
          workType: '로고 디자인',
          clientName: 'ABC 회사',
          revisions: 3,
          usageScope: ['commercial'],
          payment: {
            amount: 500000,
            currency: 'KRW',
            deposit: 150000,
          },
          timeline: {
            deadline: nextWeek,
          },
        });
      });

      expect(result.current.formData.riskLevel).toBe('low');
    });
  });

  describe('완성도 계산 통합', () => {
    test('필수 필드 입력 시 완성도 상승', () => {
      const { result } = renderHook(() => useWizard());

      expect(result.current.completeness).toBe(0);

      act(() => {
        result.current.updateFormData({
          field: 'design',
        });
      });

      const completeness1 = result.current.completeness;
      expect(completeness1).toBeGreaterThan(0);

      act(() => {
        result.current.updateFormData({
          workType: '로고 디자인',
        });
      });

      const completeness2 = result.current.completeness;
      expect(completeness2).toBeGreaterThan(completeness1);

      act(() => {
        result.current.updateFormData({
          payment: {
            amount: 500000,
            currency: 'KRW',
          },
        });
      });

      const completeness3 = result.current.completeness;
      expect(completeness3).toBeGreaterThan(completeness2);
    });

    test('모든 필드 입력 시 높은 완성도', () => {
      const { result } = renderHook(() => useWizard());

      act(() => {
        result.current.updateFormData({
          field: 'design',
          workType: '로고 디자인',
          workDescription: '상세 설명',
          clientName: 'ABC 회사',
          revisions: 3,
          usageScope: ['commercial'],
          payment: {
            amount: 500000,
            currency: 'KRW',
          },
          timeline: {
            deadline: new Date(),
          },
        });
      });

      expect(result.current.completeness).toBeGreaterThanOrEqual(80);
    });
  });

  describe('reset', () => {
    test('reset으로 초기 상태 복원', () => {
      const { result } = renderHook(() => useWizard());

      // 데이터 입력 및 단계 이동
      act(() => {
        result.current.updateFormData({
          field: 'design',
          clientName: 'ABC 회사',
        });
        result.current.goToStep(5);
      });

      expect(result.current.currentStep).toBe(5);
      expect(result.current.formData.field).toBe('design');

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.formData.field).toBeUndefined();
      expect(result.current.completeness).toBe(0);
      expect(result.current.visitedSteps).toEqual([1]);
    });
  });

  describe('currentStep 동기화', () => {
    test('formData.currentStep과 state.currentStep 동기화', () => {
      const { result } = renderHook(() => useWizard());

      act(() => {
        result.current.goToStep(5);
      });

      expect(result.current.currentStep).toBe(5);
      expect(result.current.formData.currentStep).toBe(5);
    });
  });

  describe('경계 조건', () => {
    test('범위 밖 단계로 이동 시도 시 무시', () => {
      const { result } = renderHook(() => useWizard());

      act(() => {
        result.current.goToStep(-1);
      });

      expect(result.current.currentStep).toBe(0); // 변화 없음

      act(() => {
        result.current.goToStep(100);
      });

      expect(result.current.currentStep).toBe(0); // 변화 없음
    });
  });
});
