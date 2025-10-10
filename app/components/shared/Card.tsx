'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  hover?: boolean;
  ariaLabel?: string;
}

const Card = function Card({
  children,
  className = '',
  onClick,
  selected = false,
  hover = true,
  ariaLabel,
}: CardProps) {
  const baseClasses = 'rounded-xl border-2 p-4 md:p-6 transition-all duration-200';
  const hoverClasses = hover ? 'hover:border-primary-500 hover:shadow-md cursor-pointer' : '';
  const selectedClasses = selected
    ? 'border-primary-500 bg-primary-50 shadow-lg'
    : 'border-gray-200 bg-white';

  // 키보드 접근성: onClick이 있으면 button, 없으면 div
  const Component = onClick ? 'button' : 'div';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  const commonProps = {
    className: `
      ${baseClasses}
      ${hoverClasses}
      ${selectedClasses}
      ${onClick ? 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2' : ''}
      ${className}
    `,
  };

  if (onClick) {
    return (
      <Component
        {...commonProps}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        type="button"
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-pressed={selected}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component {...commonProps}>
      {children}
    </Component>
  );
};

// ✅ React.memo로 불필요한 리렌더링 방지
export default React.memo(Card);
