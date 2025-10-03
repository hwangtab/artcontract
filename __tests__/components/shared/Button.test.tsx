import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/app/components/shared/Button';

describe('Button Component', () => {
  // 1. 기본 렌더링 (children 표시)
  test('renders correctly with children', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveTextContent('Click Me');
  });

  // 2. onClick 핸들러 동작
  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // 3. disabled 상태 (클릭 비활성화, 스타일 변경)
  test('does not call onClick handler when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeDisabled();
    fireEvent.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('applies disabled styles when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const buttonElement = screen.getByRole('button', { name: /disabled/i });
    expect(buttonElement).toHaveClass('cursor-not-allowed opacity-60');
    expect(buttonElement).toHaveClass('disabled:bg-gray-300');
  });

  // 4. variant prop (primary, secondary, danger 각각의 스타일)
  test('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>);
    const buttonElement = screen.getByRole('button', { name: /primary/i });
    expect(buttonElement).toHaveClass('bg-primary-500 text-white');
  });

  test('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const buttonElement = screen.getByRole('button', { name: /secondary/i });
    expect(buttonElement).toHaveClass('bg-transparent border-2 border-gray-300');
  });

  test('applies danger variant styles', () => {
    render(<Button variant="danger">Danger</Button>);
    const buttonElement = screen.getByRole('button', { name: /danger/i });
    expect(buttonElement).toHaveClass('bg-danger text-white');
  });

  // 5. size prop (small, medium, large 각각의 클래스)
  test('applies medium size styles by default', () => {
    render(<Button>Medium</Button>);
    const buttonElement = screen.getByRole('button', { name: /medium/i });
    expect(buttonElement).toHaveClass('px-6 py-3 text-base');
  });

  test('applies small size styles', () => {
    render(<Button size="small">Small</Button>);
    const buttonElement = screen.getByRole('button', { name: /small/i });
    expect(buttonElement).toHaveClass('px-4 py-2 text-sm');
  });

  test('applies large size styles', () => {
    render(<Button size="large">Large</Button>);
    const buttonElement = screen.getByRole('button', { name: /large/i });
    expect(buttonElement).toHaveClass('px-8 py-4 text-lg');
  });

  // 6. fullWidth prop (w-full 클래스 추가)
  test('applies fullWidth style', () => {
    render(<Button fullWidth>Full Width</Button>);
    const buttonElement = screen.getByRole('button', { name: /full width/i });
    expect(buttonElement).toHaveClass('w-full');
  });

  // 7. type prop (button, submit, reset)
  test('has "button" type by default', () => {
    render(<Button>Default Type</Button>);
    const buttonElement = screen.getByRole('button', { name: /default type/i });
    expect(buttonElement).toHaveAttribute('type', 'button');
  });

  test('can have "submit" type', () => {
    render(<Button type="submit">Submit</Button>);
    const buttonElement = screen.getByRole('button', { name: /submit/i });
    expect(buttonElement).toHaveAttribute('type', 'submit');
  });

  test('can have "reset" type', () => {
    render(<Button type="reset">Reset</Button>);
    const buttonElement = screen.getByRole('button', { name: /reset/i });
    expect(buttonElement).toHaveAttribute('type', 'reset');
  });

  // 8. className prop (커스텀 클래스 추가)
  test('applies custom className', () => {
    const customClass = 'my-custom-class';
    render(<Button className={customClass}>Custom</Button>);
    const buttonElement = screen.getByRole('button', { name: /custom/i });
    expect(buttonElement).toHaveClass(customClass);
  });
});
