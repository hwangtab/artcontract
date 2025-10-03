'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = '복사' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? '복사 완료' : '계약서 복사하기'}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        copied
          ? 'bg-success text-white'
          : 'bg-primary-500 text-white hover:bg-primary-600'
      }`}
    >
      {copied ? (
        <>
          <Check size={18} />
          복사됨!
        </>
      ) : (
        <>
          <Copy size={18} />
          {label}
        </>
      )}
    </button>
  );
}
