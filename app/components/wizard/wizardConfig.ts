import { ComponentType } from 'react';
import Step00ArtistInfo from './steps/Step00ArtistInfo';
import Step01FieldSelection from './steps/Step01FieldSelection';
import Step02WorkDetail from './steps/Step02WorkDetail';
import Step03ClientType from './steps/Step03ClientType';
import Step04Timeline from './steps/Step04Timeline';
import Step05Payment from './steps/Step05Payment';
import Step06Revisions from './steps/Step06Revisions';
import Step06bCopyright from './steps/Step06bCopyright';
import Step07UsageScope from './steps/Step07UsageScope';
import Step08Protection from './steps/Step08Protection';
import Step08FinalCheck from './steps/Step08FinalCheck';

export interface WizardStepConfig {
  id: number;
  component: ComponentType<any>;
  title: string;
  description: string;
}

/**
 * 위저드 단계 설정
 *
 * 새로운 단계 추가 방법:
 * 1. 컴포넌트 import
 * 2. WIZARD_STEPS 배열에 추가
 * 3. WizardContainer의 getStepProps에 props 매핑 추가
 *
 * 단계 순서 변경:
 * - 배열 순서만 변경하면 됨
 */
export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: 0,
    component: Step00ArtistInfo,
    title: '작가 정보',
    description: '기본 정보를 입력하세요',
  },
  {
    id: 1,
    component: Step01FieldSelection,
    title: '작업 분야 선택',
    description: '어떤 작업을 하세요?',
  },
  {
    id: 2,
    component: Step02WorkDetail,
    title: '작업 상세',
    description: '작업 내용을 자세히 알려주세요',
  },
  {
    id: 3,
    component: Step03ClientType,
    title: '클라이언트 정보',
    description: '클라이언트는 누구신가요?',
  },
  {
    id: 4,
    component: Step04Timeline,
    title: '일정',
    description: '언제까지 작업하시나요?',
  },
  {
    id: 5,
    component: Step05Payment,
    title: '금액',
    description: '얼마 받기로 하셨나요?',
  },
  {
    id: 6,
    component: Step06Revisions,
    title: '수정 횟수',
    description: '몇 번까지 수정 가능한가요?',
  },
  {
    id: 7,
    component: Step06bCopyright,
    title: '저작권',
    description: '저작권은 어떻게 하시나요?',
  },
  {
    id: 8,
    component: Step07UsageScope,
    title: '사용 범위',
    description: '어떻게 사용하시나요?',
  },
  {
    id: 9,
    component: Step08Protection,
    title: '보호 조항',
    description: '추가 보호 조항을 선택하세요',
  },
  {
    id: 10,
    component: Step08FinalCheck,
    title: '최종 확인',
    description: '계약서를 확인하고 생성하세요',
  },
];

export const TOTAL_STEPS = WIZARD_STEPS.length;
