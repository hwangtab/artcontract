import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/app/components/shared/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  // 1. Basic rendering
  test('renders correctly', () => {
    const { container } = render(<LoadingSpinner />);
    // The spinner is the first child div in the container
    const spinnerElement = container.querySelector('.animate-spin');
    expect(spinnerElement).toBeInTheDocument();
  });

  // 2. size prop
  test('applies medium size styles by default', () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerElement = container.querySelector('.animate-spin');
    expect(spinnerElement).toHaveClass('w-8 h-8');
  });

  test('applies small size styles', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    const spinnerElement = container.querySelector('.animate-spin');
    expect(spinnerElement).toHaveClass('w-5 h-5');
  });

  test('applies large size styles', () => {
    const { container } = render(<LoadingSpinner size="large" />);
    const spinnerElement = container.querySelector('.animate-spin');
    expect(spinnerElement).toHaveClass('w-12 h-12');
  });

  // Test message prop
  test('renders a message when provided', () => {
    const message = 'Loading data...';
    render(<LoadingSpinner message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test('does not render a message when not provided', () => {
    const { container } = render(<LoadingSpinner />);
    const messageElement = container.querySelector('p');
    expect(messageElement).not.toBeInTheDocument();
  });
});
