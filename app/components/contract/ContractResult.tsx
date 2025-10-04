'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GeneratedContract } from '@/types/contract';
import Button from '../shared/Button';
import Toast from '../shared/Toast';
import { Copy, Download, Share2, CheckCircle } from 'lucide-react';

interface ContractResultProps {
  contract: GeneratedContract;
  onEdit: () => void;
}

export default function ContractResult({ contract, onEdit }: ContractResultProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contract.content);
      setToastMessage('계약서가 복사되었어요!');
      setShowToast(true);
    } catch (error) {
      setToastMessage('복사에 실패했어요. 다시 시도해주세요.');
      setShowToast(true);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([contract.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // ✅ 한글 파일명 → 영문 파일명 (브라우저 호환성 개선)
    link.download = `contract_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage('계약서가 다운로드되었어요!');
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success rounded-full mb-4">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">계약서가 완성되었어요! 🎉</h1>
          <p className="text-gray-600">
            아래 내용을 확인하고 복사하거나 다운로드하세요
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <Button onClick={handleCopy}>
            <Copy size={18} />
            텍스트 복사
          </Button>
          <Button onClick={handleDownload} variant="secondary">
            <Download size={18} />
            다운로드
          </Button>
          <Button onClick={onEdit} variant="secondary">
            내용 수정하기
          </Button>
        </div>

        {/* Contract Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h1:mb-4 prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {contract.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Warnings */}
        {contract.warnings && contract.warnings.length > 0 && (
          <div className="bg-warning/10 border border-warning rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-warning-dark mb-3">⚠️ 주의사항</h3>
            <ul className="space-y-2">
              {contract.warnings.map((warning) => (
                <li key={warning.id} className="text-sm text-gray-700">
                  • {warning.message} → {warning.suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Completeness Info */}
        <div className="bg-info/10 border border-info rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-info-dark mb-3">📊 계약서 완성도</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-info transition-all"
                  style={{ width: `${contract.completeness}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold text-info">{contract.completeness}%</span>
          </div>
          {contract.completeness < 100 && (
            <p className="text-sm text-gray-700 mt-3">
              일부 항목이 누락되어 있어요. "[미정]"으로 표시된 부분을 작성해서 계약서를 완성하세요!
            </p>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📝 다음 단계</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li>1. 계약서 내용을 꼼꼼히 확인하세요</li>
            <li>2. "[미정]" 부분을 클라이언트와 협의해서 채우세요</li>
            <li>3. 계약서를 클라이언트에게 전달하세요 (카카오톡, 이메일 등)</li>
            <li>4. 양측이 서명하고 각자 한 부씩 보관하세요</li>
            <li>5. 계약금을 먼저 받고 작업을 시작하세요! 💪</li>
          </ol>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600 text-center">
          ⚠️ 본 계약서는 참고용이며 법률 자문을 대체하지 않습니다.
          <br />
          고액 계약 시 반드시 법률 전문가와 상담하세요.
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
