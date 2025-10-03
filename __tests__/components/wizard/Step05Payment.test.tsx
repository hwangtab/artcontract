import { render, fireEvent } from '@testing-library/react';
import Step05Payment from '@/app/components/wizard/steps/Step05Payment';
import { WorkItem } from '@/types/contract';

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

  test('applies work item total when requested', () => {
    const handleUpdate = jest.fn();
    const workItems: WorkItem[] = [
      { id: 'item1', title: '작곡', quantity: 1, unitPrice: 300000, subtotal: 300000 },
      { id: 'item2', title: '편곡', quantity: 1, unitPrice: 200000 },
    ];

    const { getByText } = render(
      <Step05Payment onUpdate={handleUpdate} workItems={workItems} />
    );

    fireEvent.click(getByText('합계 금액 적용'));

    expect(handleUpdate).toHaveBeenCalledWith(500000, undefined);
  });
});
