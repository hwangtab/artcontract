'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  hover?: boolean;
}

export default function Card({
  children,
  className = '',
  onClick,
  selected = false,
  hover = true,
}: CardProps) {
  const baseClasses = 'rounded-xl border-2 p-6 transition-all duration-200';
  const hoverClasses = hover ? 'hover:border-primary-500 hover:shadow-md cursor-pointer' : '';
  const selectedClasses = selected
    ? 'border-primary-500 bg-primary-50 shadow-lg'
    : 'border-gray-200 bg-white';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${selectedClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
