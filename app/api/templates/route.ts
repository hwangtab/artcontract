import { NextRequest, NextResponse } from 'next/server';
import { GetTemplateRequest, GetTemplateResponse } from '@/types/api';

// 템플릿 데이터 (나중에 GitHub에서 로드)
const templates = {
  design: {
    template_id: 'design_basic',
    name: '디자인 기본 계약서',
    description: '로고, 일러스트, 포스터 등 디자인 작업용',
    target_field: 'design',
    target_work_types: ['logo', 'illustration', 'poster', 'banner'],
    sections: {
      parties: {
        title: '1. 계약 당사자',
        template: `본 계약은 아래의 당사자 간에 체결됩니다.

갑 (클라이언트): {client_name}
연락처: {client_contact}

을 (예술가): {artist_name}
연락처: {artist_contact}`,
        required: true,
        order: 1,
      },
      work_scope: {
        title: '2. 작업 범위',
        template: `을은 갑에게 다음의 작업을 제공합니다:

작업 내용: {work_type}
상세 설명: {work_description}
작업 기한: {deadline}`,
        required: true,
        order: 2,
      },
      payment: {
        title: '3. 대금 및 지급',
        template: `작업 대금: {amount}원

{payment_schedule}

지급 방법: {payment_method}`,
        required: true,
        order: 3,
      },
      revisions: {
        title: '4. 수정 및 변경',
        template: `수정 횟수: {revisions}회까지 무료
추가 수정 시: 회당 {additional_fee}원`,
        required: true,
        order: 4,
      },
      usage_rights: {
        title: '5. 사용 권리',
        template: `사용 범위: {usage_scope}
상업적 사용: {commercial_use}`,
        required: true,
        order: 5,
      },
      copyright: {
        title: '6. 저작권',
        template: `저작권은 을에게 있으며, 갑은 본 계약에 명시된 범위 내에서만 사용할 수 있습니다.

갑이 계약 범위를 초과하여 사용할 경우, 을은 즉시 사용 중지를 요구하거나 추가 비용을 청구할 수 있습니다.`,
        required: true,
        order: 6,
      },
      cancellation: {
        title: '7. 계약 해지 및 환불',
        template: `작업 시작 전 취소: 계약금 전액 환불
작업 진행 중 취소: 진행률에 따라 차등 환불
- 30% 미만 진행: 70% 환불
- 30-70% 진행: 30% 환불
- 70% 이상 진행: 환불 불가`,
        required: true,
        order: 7,
      },
      portfolio: {
        title: '8. 포트폴리오 사용',
        template: `을은 본 작업물을 포트폴리오 및 홍보 목적으로 사용할 수 있습니다. 단, 클라이언트의 기밀 정보는 제외합니다.`,
        required: false,
        order: 8,
      },
    },
    legal_disclaimer: '본 계약서는 참고용이며 법률 자문을 대체하지 않습니다. 고액 계약 시 반드시 전문가와 상담하세요.',
  },
  photography: {
    template_id: 'photography_basic',
    name: '사진/영상 기본 계약서',
    description: '촬영 및 영상 제작용',
    target_field: 'photography',
    target_work_types: ['portrait', 'event', 'product', 'commercial'],
    sections: {
      parties: {
        title: '1. 계약 당사자',
        template: `본 계약은 아래의 당사자 간에 체결됩니다.

갑 (클라이언트): {client_name}
을 (작가): {artist_name}`,
        required: true,
        order: 1,
      },
      work_scope: {
        title: '2. 촬영 범위',
        template: `촬영 내용: {work_type}
촬영 일시: {shoot_date}
제공 컷 수: {deliverables}`,
        required: true,
        order: 2,
      },
      payment: {
        title: '3. 촬영비 및 지급',
        template: `촬영비: {amount}원
{payment_schedule}`,
        required: true,
        order: 3,
      },
      usage_rights: {
        title: '4. 저작권 및 사용권',
        template: `저작권은 을에게 있으며, 갑은 합의된 범위 내에서 사용할 수 있습니다.
사용 범위: {usage_scope}

원본 파일(RAW 파일)은 을이 보관하며, 갑에게는 보정 완료본만 제공합니다.`,
        required: true,
        order: 4,
      },
      revisions: {
        title: '5. 수정 및 재촬영',
        template: `보정 수정: {revisions}회까지 무료
재촬영은 별도 협의 및 추가 비용이 발생합니다.`,
        required: false,
        order: 5,
      },
      cancellation: {
        title: '6. 취소 및 환불',
        template: `촬영 3일 전 취소: 전액 환불
촬영 1-2일 전 취소: 50% 환불
촬영 당일 취소 또는 노쇼: 환불 불가`,
        required: true,
        order: 6,
      },
    },
    legal_disclaimer: '본 계약서는 참고용이며 법률 자문을 대체하지 않습니다.',
  },
  writing: {
    template_id: 'writing_basic',
    name: '글쓰기 기본 계약서',
    description: '카피라이팅, 콘텐츠 작성용',
    target_field: 'writing',
    target_work_types: ['copywriting', 'content', 'script'],
    sections: {
      parties: {
        title: '1. 계약 당사자',
        template: `갑 (클라이언트): {client_name}
을 (작가): {artist_name}`,
        required: true,
        order: 1,
      },
      work_scope: {
        title: '2. 작업 범위',
        template: `작성 내용: {work_type}
분량: {word_count}
마감일: {deadline}`,
        required: true,
        order: 2,
      },
      payment: {
        title: '3. 원고료',
        template: `원고료: {amount}원
{payment_schedule}`,
        required: true,
        order: 3,
      },
      revisions: {
        title: '4. 수정 및 변경',
        template: `수정 횟수: {revisions}회까지 무료
추가 수정 시: 회당 {additional_fee}원

전면 수정(원고 재작성 수준)은 별도 협의 및 추가 비용이 발생합니다.`,
        required: true,
        order: 4,
      },
      copyright: {
        title: '5. 저작권',
        template: `저작권은 을에게 있으며, 갑은 계약된 범위 내에서 사용할 수 있습니다.

을은 본 원고를 포트폴리오로 사용할 수 있습니다.`,
        required: true,
        order: 5,
      },
    },
    legal_disclaimer: '본 계약서는 참고용입니다.',
  },
  music: {
    template_id: 'music_basic',
    name: '음악 기본 계약서',
    description: '작곡, 편곡, 녹음용',
    target_field: 'music',
    target_work_types: ['composition', 'arrangement', 'recording'],
    sections: {
      parties: {
        title: '1. 계약 당사자',
        template: `갑 (클라이언트): {client_name}
을 (작곡가): {artist_name}`,
        required: true,
        order: 1,
      },
      work_scope: {
        title: '2. 작업 범위',
        template: `작업 내용: {work_type}
재생 시간: {duration}
마감일: {deadline}`,
        required: true,
        order: 2,
      },
      payment: {
        title: '3. 제작비',
        template: `제작비: {amount}원`,
        required: true,
        order: 3,
      },
      revisions: {
        title: '4. 수정 및 변경',
        template: `수정 횟수: {revisions}회까지 무료
대폭 변경(재작곡 수준)은 별도 협의 및 추가 비용이 발생합니다.`,
        required: true,
        order: 4,
      },
      copyright: {
        title: '5. 저작권 및 사용권',
        template: `저작권은 을에게 있으며, 갑은 계약된 범위 내에서 사용할 수 있습니다.
사용 범위: {usage_scope}

갑이 본 음원을 수정하거나 2차 저작물을 만드는 것은 금지됩니다.`,
        required: true,
        order: 5,
      },
      source_files: {
        title: '6. 원본 파일',
        template: `원본 파일(프로젝트 파일, 스템 등)은 을이 보관하며, 갑에게는 마스터링 완료본만 제공합니다.
원본 파일이 필요한 경우 별도 협의 및 추가 비용이 발생합니다.`,
        required: false,
        order: 6,
      },
    },
    legal_disclaimer: '본 계약서는 참고용입니다.',
  },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const field = searchParams.get('field');

    if (!field) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: '분야를 지정해주세요.',
          },
          timestamp: new Date().toISOString(),
        } as GetTemplateResponse,
        { status: 400 }
      );
    }

    const template = templates[field as keyof typeof templates];

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: '해당 분야의 템플릿을 찾을 수 없습니다.',
          },
          timestamp: new Date().toISOString(),
        } as GetTemplateResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { template },
      timestamp: new Date().toISOString(),
    } as GetTemplateResponse);
  } catch (error) {
    console.error('Template API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TEMPLATE_ERROR',
          message: '템플릿을 불러오는 중 오류가 발생했습니다.',
        },
        timestamp: new Date().toISOString(),
      } as GetTemplateResponse,
      { status: 500 }
    );
  }
}
