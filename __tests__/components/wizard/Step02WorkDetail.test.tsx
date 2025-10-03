import { render, fireEvent } from '@testing-library/react';
import Step02WorkDetail from '@/app/components/wizard/steps/Step02WorkDetail';

describe('Step02WorkDetail', () => {
  test('manual input updates selection', () => {
    const handleSelect = jest.fn();

    const { getByPlaceholderText } = render(
      <Step02WorkDetail field="design" onSelect={handleSelect} />
    );

    const textarea = getByPlaceholderText(/카페 로고를 만들어주세요/);

    fireEvent.change(textarea, { target: { value: '로고 디자인 의뢰' } });

    expect(handleSelect).toHaveBeenLastCalledWith(
      '로고 디자인 의뢰',
      '로고 디자인 의뢰',
      undefined
    );
  });

  test('quick example applies selection', () => {
    const handleSelect = jest.fn();

    const { getByText } = render(
      <Step02WorkDetail field="design" onSelect={handleSelect} />
    );

    fireEvent.click(getByText('예시 보기'));
    fireEvent.click(getByText('카페 로고 디자인'));

    expect(handleSelect).toHaveBeenLastCalledWith(
      '카페 로고 디자인',
      '카페 로고 디자인',
      undefined
    );
  });
});
