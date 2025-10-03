'use client';

import React, { useId } from 'react';

interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'tel' | 'date';
  error?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Input({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  error,
  helper,
  required = false,
  disabled = false,
  className = '',
}: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const inputClasses = `
    w-full h-12 px-4 rounded-lg border-2 transition-all
    ${error ? 'border-danger focus:border-danger' : 'border-gray-300 focus:border-primary-500'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    focus:outline-none focus:ring-2 focus:ring-primary-500/20
  `;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="font-medium text-gray-700">
          {label}
          {required && <span className="text-danger ml-1" aria-label="필수">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helper ? helperId : undefined}
        className={inputClasses}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      {helper && !error && (
        <p id={helperId} className="text-sm text-gray-500">
          {helper}
        </p>
      )}
    </div>
  );
}
