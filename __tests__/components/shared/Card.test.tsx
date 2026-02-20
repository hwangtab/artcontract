import { render, screen, fireEvent } from '@testing-library/react';
import Card from '@/app/components/shared/Card';

describe('Card Component', () => {
  // 1. Basic rendering
  test('renders correctly', () => {
    const { container } = render(<Card>Test</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveClass('rounded-xl border-2 p-4 md:p-6');
  });

  // 2. children rendering
  test('renders children correctly', () => {
    render(
      <Card>
        <h1>Card Title</h1>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByRole('heading', { name: /card title/i })).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  // 3. className prop
  test('applies custom className', () => {
    const customClass = 'my-custom-card';
    const { container } = render(<Card className={customClass}>Custom Card</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass(customClass);
  });

  // Test onClick handler
  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    const { container } = render(<Card onClick={handleClick}>Clickable</Card>);
    const cardElement = container.firstChild as HTMLElement;
    fireEvent.click(cardElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test selected state
  test('applies selected styles when selected is true', () => {
    const { container } = render(<Card selected>Selected Card</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('border-primary-500 bg-primary-50 shadow-lg');
  });

  // Test unselected state
  test('applies default styles when not selected', () => {
    const { container } = render(<Card>Default Card</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('border-gray-200 bg-white');
  });

  // Test hover effect enabled by default
  test('has hover effects by default', () => {
    const { container } = render(<Card>Hover Card</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('hover:border-primary-500 hover:shadow-md cursor-pointer');
  });

  // Test hover effect disabled
  test('disables hover effects when hover is false', () => {
    const { container } = render(<Card hover={false}>No Hover Card</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).not.toHaveClass('hover:border-primary-500 hover:shadow-md cursor-pointer');
  });
});
