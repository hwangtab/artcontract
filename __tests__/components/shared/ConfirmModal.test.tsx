import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmModal from '@/app/components/shared/ConfirmModal';

describe('ConfirmModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('모달이 닫혀있을 때 렌더링되지 않음', () => {
    render(
      <ConfirmModal
        isOpen={false}
        title="테스트 제목"
        message="테스트 메시지"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('모달이 열려있을 때 제목과 메시지가 렌더링됨', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="중복 항목 감지"
        message="같은 항목이 존재합니다."
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('중복 항목 감지')).toBeInTheDocument();
    expect(screen.getByText('같은 항목이 존재합니다.')).toBeInTheDocument();
  });

  it('확인 버튼 클릭 시 onConfirm 호출됨', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="테스트"
        message="테스트 메시지"
        confirmLabel="네"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: '네' });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('취소 버튼 클릭 시 onCancel 호출됨', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="테스트"
        message="테스트 메시지"
        cancelLabel="아니오"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: '아니오' });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('ESC 키 입력 시 onCancel 호출됨', async () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="테스트"
        message="테스트 메시지"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  it('백드롭 클릭 시 onCancel 호출됨', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="테스트"
        message="테스트 메시지"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('모달 내부 클릭 시 onCancel 호출되지 않음', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="테스트"
        message="테스트 메시지"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const modalContent = screen.getByText('테스트');
    fireEvent.click(modalContent);

    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('커스텀 버튼 레이블이 적용됨', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="테스트"
        message="테스트 메시지"
        confirmLabel="추가하기"
        cancelLabel="닫기"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('button', { name: '추가하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('기본 버튼 레이블이 적용됨', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="테스트"
        message="테스트 메시지"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('ARIA 속성이 올바르게 설정됨', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="테스트 제목"
        message="테스트 메시지"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-message');
  });

  it('React 노드를 message로 받을 수 있음', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="테스트"
        message={
          <>
            <strong>강조된 텍스트</strong>
            <br />
            일반 텍스트
          </>
        }
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('강조된 텍스트')).toBeInTheDocument();
    expect(screen.getByText('일반 텍스트')).toBeInTheDocument();
  });
});
