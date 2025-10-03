import { render, fireEvent } from '@testing-library/react';
import Step05Payment from '@/app/components/wizard/steps/Step05Payment';

describe('Step05Payment', () => {
  test('clears deposit when input emptied', () => {
    const handleUpdate = jest.fn();

    const { getByLabelText } = render(
      <Step05Payment amount={200000} onUpdate={handleUpdate} />
    );

    const depositInput = getByLabelText('계약금 (선금)');

    fireEvent.change(depositInput, { target: { value: '150000' } });
    expect(handleUpdate).toHaveBeenCalledWith(200000, 150000);

    fireEvent.change(depositInput, { target: { value: '' } });
    expect(handleUpdate).toHaveBeenCalledWith(200000, undefined);
  });
});
