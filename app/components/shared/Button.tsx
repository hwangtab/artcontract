'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseClasses =
    'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2';

  const variantClasses = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-600 active:scale-95 disabled:bg-gray-300',
    secondary:
      'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-500 disabled:border-gray-200 disabled:text-gray-400',
    danger:
      'bg-danger text-white hover:bg-red-600 active:scale-95 disabled:bg-gray-300',
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
}
