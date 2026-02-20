import { render, fireEvent } from '@testing-library/react';
import Step02WorkDetail from '@/app/components/wizard/steps/Step02WorkDetail';
import { ArtField } from '@/types/contract';

describe('Step02WorkDetail', () => {
  const setup = (field: ArtField = 'music') => {
    const handleUpdate = jest.fn();
    const utils = render(
      <Step02WorkDetail field={field} onUpdate={handleUpdate} />
    );
    return { ...utils, handleUpdate };
  };

  test('manual description update notifies parent', () => {
    const { getByPlaceholderText, handleUpdate } = setup();

    const textarea = getByPlaceholderText(/작곡이 메인이지만 편곡, 믹싱, 마스터링도 함께 진행합니다/);

    fireEvent.change(textarea, { target: { value: '작곡과 편곡을 맡았습니다.' } });

    expect(handleUpdate).toHaveBeenCalledWith({
      workDescription: '작곡과 편곡을 맡았습니다.',
      workType: '작곡과 편곡을 맡았습니다.',
    });
  });

  test('preset task button adds new work item', () => {
    const { getByText, handleUpdate } = setup();

    fireEvent.click(getByText('+ 작곡'));

    expect(handleUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        workItems: [
          expect.objectContaining({
            title: '작곡',
            description: '메인 테마/멜로디 작곡',
          }),
        ],
        workType: '작곡',
      })
    );
  });

  test('quick example populates description', () => {
    const { getByText, handleUpdate } = setup('design');

    fireEvent.click(getByText('예시 보기'));
    fireEvent.click(getByText('브랜드 로고 디자인'));

    expect(handleUpdate).toHaveBeenCalledWith({
      workDescription: '브랜드 로고 디자인',
      workType: '브랜드 로고 디자인',
    });
  });
});
