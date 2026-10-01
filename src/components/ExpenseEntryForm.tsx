import React, { useState } from 'react';
import {
  ExpenseItem,
  ExpenseCategory,
  PaymentMethod,
  ReceiptType,
  DEFAULT_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_RECEIPT_TYPES,
} from '../types/expense';
import { parseReceiptText } from '../utils/receiptParser';
import { PlusCircle, Sparkles, Check, Wand2 } from 'lucide-react';

interface ExpenseEntryFormProps {
  onAddExpense: (item: Omit<ExpenseItem, 'id' | 'receiptNumber'>) => void;
  nextReceiptNo: number;
}

const QUICK_MERCHANTS: { name: string; category: ExpenseCategory; purpose: string }[] = [
  { name: '스타벅스', category: '식대/복리후생비', purpose: '클라이언트 미팅 및 업무 다과' },
  { name: '직원 점심 식대', category: '식대/복리후생비', purpose: '팀원 중식대' },
  { name: '카카오T (택시)', category: '교통비/유류비', purpose: '야근 귀가 및 고객사 외근' },
  { name: '알파문구', category: '사무용품비', purpose: '사무용 필기구 및 복사용지 구매' },
  { name: 'GS칼텍스 주유소', category: '교통비/유류비', purpose: '업무용 차량 유류비' },
  { name: '교보문고', category: '도서인쇄비', purpose: '업무 관련 기술 도서 구매' },
];

export const ExpenseEntryForm: React.FC<ExpenseEntryFormProps> = ({
  onAddExpense,
  nextReceiptNo,
}) => {
  const [smsInput, setSmsInput] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('식대/복리후생비');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('개인카드(사후정산)');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [hasVat, setHasVat] = useState(true);
  const [receiptType, setReceiptType] = useState<ReceiptType>('신용카드매출전표');
  const [purpose, setPurpose] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate supply and VAT
  const numAmount = Number(totalAmount.replace(/[^0-9]/g, '')) || 0;
  const supplyAmount = hasVat ? Math.round(numAmount / 1.1) : numAmount;
  const vatAmount = numAmount - supplyAmount;

  // Handle Quick SMS Parse
  const handleParseSms = () => {
    if (!smsInput.trim()) return;
    const parsed = parseReceiptText(smsInput);
    if (parsed.totalAmount > 0) {
      setTotalAmount(String(parsed.totalAmount));
    }
    if (parsed.merchant && parsed.merchant !== '사용처 미정') {
      setMerchant(parsed.merchant);
    }
    if (parsed.date) {
      setDate(parsed.date);
    }
    setCategory(parsed.category);
    setPaymentMethod(parsed.paymentMethod);
    setReceiptType(parsed.receiptType);
    if (parsed.purpose) {
      setPurpose(parsed.purpose);
    }
    setSmsInput('');
  };

  // Handle Quick Merchant Click
  const handleQuickMerchant = (item: typeof QUICK_MERCHANTS[0]) => {
    setMerchant(item.name);
    setCategory(item.category);
    setPurpose(item.purpose);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!merchant.trim()) {
      setErrorMessage('사용처(상호명)를 입력해주세요.');
      return;
    }
    if (numAmount <= 0) {
      setErrorMessage('지출 금액을 0원보다 크게 입력해주세요.');
      return;
    }

    onAddExpense({
      date,
      merchant: merchant.trim(),
      category,
      paymentMethod,
      totalAmount: numAmount,
      hasVat,
      supplyAmount,
      vatAmount,
      receiptType,
      purpose: purpose.trim() || `${category} 지출`,
    });

    // Reset fields for fast next entry
    setTotalAmount('');
    setMerchant('');
    setPurpose('');
    setErrorMessage('');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-6">
      {/* Top Banner / SMS Quick Parser */}
      <div className="mb-5 pb-4 border-b border-neutral-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-semibold text-neutral-800">
              카드 승인 문자 / 카톡 영수증 빠른 자동 완성
            </span>
          </div>
          <span className="text-[11px] text-neutral-400">
            문자를 붙여넣으면 일자·상호·금액이 자동 파싱됩니다
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={smsInput}
            onChange={(e) => setSmsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleParseSms();
              }
            }}
            placeholder="예: [신한체크승인] 09/28 12:30 18,000원 삼진식당 승인"
            className="flex-1 h-8 px-3 text-xs bg-neutral-50/70 border border-neutral-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
          <button
            type="button"
            onClick={handleParseSms}
            disabled={!smsInput.trim()}
            className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded disabled:opacity-40 transition-colors"
          >
            자동 채우기
          </button>
        </div>

        {/* Quick Merchant Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          <span className="text-[11px] text-neutral-400 mr-1">자주 쓰는 사용처:</span>
          {QUICK_MERCHANTS.map((qm) => (
            <button
              key={qm.name}
              type="button"
              onClick={() => handleQuickMerchant(qm)}
              className="px-2 py-0.5 text-[11px] text-neutral-600 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-900 rounded transition-colors"
            >
              {qm.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* 1. Date */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              사용일자 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-8 px-2.5 bg-white border border-neutral-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* 2. Merchant */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              사용처 (상호명 / 가맹점) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="스타벅스 테헤란로점"
              value={merchant}
              onChange={(e) => {
                setMerchant(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full h-8 px-2.5 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* 3. Category */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              계정과목 <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full h-8 px-2 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Payment Method */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              결제수단 <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                const method = e.target.value as PaymentMethod;
                setPaymentMethod(method);
                if (method === '현금영수증') {
                  setReceiptType('현금영수증');
                } else if (method === '전자세금계산서') {
                  setReceiptType('전자세금계산서');
                } else {
                  setReceiptType('신용카드매출전표');
                }
              }}
              className="w-full h-8 px-2 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
            >
              {DEFAULT_PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Total Amount & VAT breakdown */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1 flex items-center justify-between">
              <span>
                지출 총금액 (원) <span className="text-red-500">*</span>
              </span>
              <label className="flex items-center gap-1 text-[11px] font-normal text-neutral-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVat}
                  onChange={(e) => setHasVat(e.target.checked)}
                  className="w-3 h-3 text-emerald-700 rounded"
                />
                <span>부가세(10%) 포함</span>
              </label>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                placeholder="0"
                value={totalAmount}
                onChange={(e) => {
                  setTotalAmount(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full h-8 px-2.5 pr-8 bg-white border border-neutral-300 rounded font-mono tabular-nums text-right focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <span className="absolute right-2.5 top-2 text-neutral-400 pointer-events-none">
                원
              </span>
            </div>

            {/* Live supply & vat calculation hint */}
            {numAmount > 0 && (
              <div className="mt-1 text-[11px] text-neutral-500 flex items-center justify-between font-mono tabular-nums">
                <span>공급가: {supplyAmount.toLocaleString()}원</span>
                <span>부가세: {vatAmount.toLocaleString()}원</span>
              </div>
            )}
          </div>

          {/* 6. Receipt Type */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">증빙구분</label>
            <select
              value={receiptType}
              onChange={(e) => setReceiptType(e.target.value as ReceiptType)}
              className="w-full h-8 px-2 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              {DEFAULT_RECEIPT_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Purpose & Attendees (Spans 2 cols) */}
          <div className="sm:col-span-2">
            <label className="block font-medium text-neutral-700 mb-1">
              사용목적 및 참석자 / 비고
            </label>
            <input
              type="text"
              placeholder="예: 4분기 마케팅 전략 회의 식대 (참석: 김팀장, 이대리)"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full h-8 px-2.5 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="mt-3 text-xs text-red-500 font-medium">{errorMessage}</div>
        )}

        {/* Submit Bar */}
        <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            {justAdded ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                영수증 No. {nextReceiptNo - 1} 항목이 정산 대장에 등록되었습니다.
              </span>
            ) : (
              <span>
                다음 증빙 번호: <strong className="font-mono text-neutral-800">No. {nextReceiptNo}</strong>
              </span>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-md transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>영수증 항목 추가 (+ Enter)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
