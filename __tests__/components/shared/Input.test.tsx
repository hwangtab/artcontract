import { render, screen, fireEvent } from '@testing-library/react';
import Input from '@/app/components/shared/Input';

describe('Input Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  // 1. Basic rendering with label
  test('renders correctly with a label', () => {
    render(<Input label="Test Label" value="" onChange={mockOnChange} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  // 2. onChange handler
  test('calls onChange handler when text is entered', () => {
    render(<Input label="Test Label" value="" onChange={mockOnChange} />);
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'new value' } });
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('new value');
  });

  // 3. value prop
  test('displays the correct value from the value prop', () => {
    render(<Input label="Test Label" value="test value" onChange={mockOnChange} />);
    const inputElement = screen.getByDisplayValue('test value') as HTMLInputElement;
    expect(inputElement.value).toBe('test value');
  });

  // 4. placeholder
  test('displays a placeholder', () => {
    render(<Input label="Test Label" value="" onChange={mockOnChange} placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  // 5. error state and message
  test('renders in an error state with a message', () => {
    const errorMessage = 'This field is required';
    render(<Input label="Test Label" value="" onChange={mockOnChange} error={errorMessage} />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass('border-danger');
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-danger');
  });

  // 6. disabled state
  test('is disabled when the disabled prop is true', () => {
    render(<Input label="Test Label" value="" onChange={mockOnChange} disabled />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeDisabled();
    expect(inputElement).toHaveClass('bg-gray-100 cursor-not-allowed');
  });

  // 7. required field
  test('shows a required indicator when required prop is true', () => {
    render(<Input label="Test Label" value="" onChange={mockOnChange} required />);
    const labelElement = screen.getByText('Test Label');
    const requiredIndicator = screen.getByText('*');
    expect(labelElement).toBeInTheDocument();
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveClass('text-danger');
  });

  // 8. type prop (text, number, email, etc.)
  test.each(['text', 'number', 'email', 'tel', 'date'])(
    'renders with the correct type attribute: %s',
    (type) => {
      render(
        <Input
          label="Test Label"
          value=""
          onChange={mockOnChange}
          type={type as 'text' | 'number' | 'email' | 'tel' | 'date'}
        />
      );
      const inputElement = type === 'text' || type === 'email'
        ? screen.getByRole('textbox')
        : screen.getByDisplayValue('');
      expect(inputElement).toHaveAttribute('type', type);
    }
  );

  test('does not render helper text when there is an error', () => {
    render(
      <Input
        label="Test Label"
        value=""
        onChange={mockOnChange}
        error="Error message"
        helper="Helper text"
      />
    );
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  test('renders helper text when provided and no error exists', () => {
    render(<Input label="Test Label" value="" onChange={mockOnChange} helper="Helper text" />);
    expect(screen.getByText('Helper text')).toBeInTheDocument();
    expect(screen.getByText('Helper text')).toHaveClass('text-gray-500');
  });
});
