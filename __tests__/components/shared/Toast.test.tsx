import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Toast from '@/app/components/shared/Toast';
import { act } from 'react';

describe('Toast Component', () => {
  jest.useFakeTimers();

  const message = 'This is a toast message.';
  const handleClose = jest.fn();

  beforeEach(() => {
    handleClose.mockClear();
  });

  // 1. Basic rendering & 2. message display
  test('renders correctly with a message', () => {
    render(<Toast message={message} onClose={handleClose} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  // 3. type variants (success, error, info)
  test('applies info styles by default', () => {
    render(<Toast message={message} onClose={handleClose} />);
    const toastElement = screen.getByText(message).closest('div');
    expect(toastElement).toHaveClass('bg-info');
  });

  test('applies success styles', () => {
    render(<Toast message={message} type="success" onClose={handleClose} />);
    const toastElement = screen.getByText(message).closest('div');
    expect(toastElement).toHaveClass('bg-success');
  });

  test('applies error styles', () => {
    render(<Toast message={message} type="error" onClose={handleClose} />);
    const toastElement = screen.getByText(message).closest('div');
    expect(toastElement).toHaveClass('bg-danger');
  });

  // 5. onClose callback (on manual close)
  test('calls onClose when the close button is clicked', async () => {
    render(<Toast message={message} onClose={handleClose} />);
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    // Wait for the fade-out animation timeout
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  // 4. auto-dismiss after duration
  test('calls onClose automatically after the specified duration', async () => {
    const duration = 5000;
    render(<Toast message={message} duration={duration} onClose={handleClose} />);

    // Fast-forward time by the duration
    await act(async () => {
      jest.advanceTimersByTime(duration);
    });

    // Fast-forward time for the fade-out animation
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  test('resets timer if duration changes', async () => {
    const initialDuration = 5000;
    const { rerender } = render(
      <Toast message={message} duration={initialDuration} onClose={handleClose} />
    );

    // Advance time, but not enough to close
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Rerender with a new duration
    const newDuration = 4000;
    rerender(<Toast message={message} duration={newDuration} onClose={handleClose} />);

    // Advance time by the remaining initial duration, it should NOT close
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(handleClose).not.toHaveBeenCalled();

    // Advance time by the new duration, it should close now
    await act(async () => {
      jest.advanceTimersByTime(2000); // Total of 4000ms for the new timer
    });
    await act(async () => {
      jest.advanceTimersByTime(300); // Animation
    });

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
