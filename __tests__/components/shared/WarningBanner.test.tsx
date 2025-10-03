import { render, screen, fireEvent } from '@testing-library/react';
import WarningBanner from '@/app/components/shared/WarningBanner';

describe('WarningBanner Component', () => {
  const message = 'This is a test message.';
  const suggestion = 'This is a suggestion.';

  // 1. Basic rendering & 3. message rendering
  test('renders the message correctly', () => {
    render(<WarningBanner severity="info" message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test('renders the suggestion when provided', () => {
    render(<WarningBanner severity="info" message={message} suggestion={suggestion} />);
    expect(screen.getByText(suggestion)).toBeInTheDocument();
  });

  // 2. severity styles (info, warning, danger)
  test('applies info severity styles', () => {
    const { container } = render(<WarningBanner severity="info" message={message} />);
    const banner = container.firstChild;
    expect(banner).toHaveClass('bg-info/10 border-info');
    const icon = container.querySelector('svg');
    expect(icon).toHaveClass('text-info');
    expect(screen.getByText(message)).toHaveClass('text-info');
  });

  test('applies warning severity styles', () => {
    const { container } = render(<WarningBanner severity="warning" message={message} />);
    const banner = container.firstChild;
    expect(banner).toHaveClass('bg-warning/10 border-warning');
    const icon = container.querySelector('svg');
    expect(icon).toHaveClass('text-warning');
    expect(screen.getByText(message)).toHaveClass('text-warning');
  });

  test('applies danger severity styles', () => {
    const { container } = render(<WarningBanner severity="danger" message={message} />);
    const banner = container.firstChild;
    expect(banner).toHaveClass('bg-danger/10 border-danger');
    const icon = container.querySelector('svg');
    expect(icon).toHaveClass('text-danger');
    expect(screen.getByText(message)).toHaveClass('text-danger');
  });

  // 4. dismissible functionality
  test('calls onDismiss when the dismiss button is clicked', () => {
    const handleDismiss = jest.fn();
    render(<WarningBanner severity="warning" message={message} onDismiss={handleDismiss} dismissible />);
    const dismissButton = screen.getByRole('button', { name: /닫기/i });
    fireEvent.click(dismissButton);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  test('does not render dismiss button if not dismissible', () => {
    render(<WarningBanner severity="warning" message={message} dismissible={false} />);
    const dismissButton = screen.queryByRole('button', { name: /닫기/i });
    expect(dismissButton).not.toBeInTheDocument();
  });

  test('does not render dismiss button if onDismiss is not provided', () => {
    render(<WarningBanner severity="warning" message={message} dismissible />);
    const dismissButton = screen.queryByRole('button', { name: /닫기/i });
    expect(dismissButton).not.toBeInTheDocument();
  });

  // 5. actions rendering
  test('renders actions when provided', () => {
    const actions = <button>Action Button</button>;
    render(<WarningBanner severity="info" message={message} actions={actions} />);
    expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
  });
});
