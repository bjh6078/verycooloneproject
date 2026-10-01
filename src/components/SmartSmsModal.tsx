import React, { useState } from 'react';
import { ExpenseItem } from '../types/expense';
import { parseReceiptText } from '../utils/receiptParser';
import { MessageSquareText, X, Check, ArrowRight } from 'lucide-react';

interface SmartSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMultiple: (items: Omit<ExpenseItem, 'id' | 'receiptNumber'>[]) => void;
}

const SAMPLE_BULK_SMS = `[신한체크승인] 09/25 12:43 14,500원 삼진식당
[KB국민카드] 09/26 19:30 스타벅스강남 18,200원 승인
[현대카드] 09/27 14:10 카카오T 12,800원 승인
[하나카드] 09/28 11:20 알파문구 32,000원 승인
[신한체크승인] 09/29 18:50 교보문고 26,000원 승인`;

export const SmartSmsModal: React.FC<SmartSmsModalProps> = ({
  isOpen,
  onClose,
  onAddMultiple,
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  // Split lines and parse each
  const lines = inputText.split('\n').filter((l) => l.trim().length > 3);
  const parsedItems = lines.map((line) => {
    const p = parseReceiptText(line);
    const supply = Math.round(p.totalAmount / 1.1);
    const vat = p.totalAmount - supply;

    return {
      date: p.date,
      merchant: p.merchant,
      category: p.category,
      paymentMethod: p.paymentMethod,
      totalAmount: p.totalAmount,
      hasVat: true,
      supplyAmount: supply,
      vatAmount: vat,
      receiptType: p.receiptType,
      purpose: p.purpose,
    };
  });

  const handleApply = () => {
    if (parsedItems.length === 0) return;
    onAddMultiple(parsedItems);
    setInputText('');
    onClose();
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_BULK_SMS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-semibold text-neutral-900">
              카드 결제 문자 / 알림톡 일괄 등록
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-neutral-700">
                문자 메시지를 줄바꿈으로 구분하여 여러 건 붙여넣으세요:
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-[11px] text-emerald-800 hover:underline font-medium"
              >
                예시 문자 5건 채우기
              </button>
            </div>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="예:&#10;[신한체크승인] 09/25 12:43 14,500원 삼진식당&#10;[KB카드] 09/26 19:30 스타벅스 18,200원 승인&#10;[현대카드] 09/27 카카오T 12,800원"
              className="w-full p-3 font-mono text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Parsed Preview Table */}
          {parsedItems.length > 0 && (
            <div>
              <div className="font-medium text-neutral-800 mb-2 flex items-center justify-between">
                <span>자동 분석된 영수증 목록 ({parsedItems.length}건)</span>
                <span className="text-neutral-500 font-mono">
                  합계:{' '}
                  {parsedItems
                    .reduce((acc, it) => acc + it.totalAmount, 0)
                    .toLocaleString()}
                  원
                </span>
              </div>
              <div className="border border-neutral-200 rounded max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-neutral-100 text-neutral-600 sticky top-0">
                    <tr>
                      <th className="px-2.5 py-1.5 border-r border-neutral-200">일자</th>
                      <th className="px-2.5 py-1.5 border-r border-neutral-200">사용처</th>
                      <th className="px-2.5 py-1.5 border-r border-neutral-200">계정과목</th>
                      <th className="px-2.5 py-1.5 border-r border-neutral-200">결제수단</th>
                      <th className="px-2.5 py-1.5 text-right font-semibold text-neutral-900">
                        금액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {parsedItems.map((p, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="px-2.5 py-1.5 font-mono text-neutral-600 border-r border-neutral-200">
                          {p.date}
                        </td>
                        <td className="px-2.5 py-1.5 font-medium text-neutral-900 border-r border-neutral-200">
                          {p.merchant}
                        </td>
                        <td className="px-2.5 py-1.5 text-neutral-600 border-r border-neutral-200">
                          {p.category}
                        </td>
                        <td className="px-2.5 py-1.5 text-neutral-600 border-r border-neutral-200">
                          {p.paymentMethod}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono tabular-nums font-semibold text-neutral-900">
                          {p.totalAmount.toLocaleString()}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              disabled={parsedItems.length === 0}
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 rounded transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{parsedItems.length}건 정산 대장에 등록</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
