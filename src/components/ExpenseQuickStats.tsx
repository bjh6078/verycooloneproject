import React from 'react';
import { ExpenseItem } from '../types/expense';

interface ExpenseQuickStatsProps {
  items: ExpenseItem[];
}

export const ExpenseQuickStats: React.FC<ExpenseQuickStatsProps> = ({ items }) => {
  const totalAmount = items.reduce((acc, it) => acc + (Number(it.totalAmount) || 0), 0);
  const totalSupply = items.reduce((acc, it) => acc + (Number(it.supplyAmount) || 0), 0);
  const totalVat = items.reduce((acc, it) => acc + (Number(it.vatAmount) || 0), 0);

  // Personal card & cash reimbursement amount (crucial for applicant!)
  const personalReimburse = items
    .filter((it) => it.paymentMethod.includes('개인카드') || it.paymentMethod === '계좌이체')
    .reduce((acc, it) => acc + (Number(it.totalAmount) || 0), 0);

  // Corporate card
  const corporateCard = items
    .filter((it) => it.paymentMethod === '법인카드')
    .reduce((acc, it) => acc + (Number(it.totalAmount) || 0), 0);

  // Category breakdown top 3
  const categoryMap: Record<string, number> = {};
  items.forEach((it) => {
    categoryMap[it.category] = (categoryMap[it.category] || 0) + (Number(it.totalAmount) || 0);
  });
  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Amount */}
        <div className="p-4 bg-white border border-neutral-200 rounded-lg">
          <div className="text-xs font-medium text-neutral-500 mb-1">총 지출 결의 금액</div>
          <div className="text-2xl font-semibold text-neutral-900 font-mono tabular-nums">
            {totalAmount.toLocaleString('ko-KR')}
            <span className="text-xs font-sans text-neutral-500 font-normal ml-1">원</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1.5">
            <span>영수증 {items.length}건 등록됨</span>
          </div>
        </div>

        {/* Metric 2: Personal Reimbursement (HIGHLIGHTED) */}
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg">
          <div className="text-xs font-medium text-emerald-800 mb-1 flex items-center justify-between">
            <span>개인 실비 청구액 (환급)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
              통장 입금 예정
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-900 font-mono tabular-nums">
            {personalReimburse.toLocaleString('ko-KR')}
            <span className="text-xs font-sans text-emerald-700 font-normal ml-1">원</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            개인카드 / 현금 지출 환급분
          </div>
        </div>

        {/* Metric 3: Corporate Card */}
        <div className="p-4 bg-white border border-neutral-200 rounded-lg">
          <div className="text-xs font-medium text-neutral-500 mb-1">법인카드 사용액</div>
          <div className="text-2xl font-semibold text-neutral-900 font-mono tabular-nums">
            {corporateCard.toLocaleString('ko-KR')}
            <span className="text-xs font-sans text-neutral-500 font-normal ml-1">원</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            회사 카드 대금 직접 결제분
          </div>
        </div>

        {/* Metric 4: VAT deduction */}
        <div className="p-4 bg-white border border-neutral-200 rounded-lg">
          <div className="text-xs font-medium text-neutral-500 mb-1">부가세 매입세액 공제액</div>
          <div className="text-2xl font-semibold text-neutral-900 font-mono tabular-nums">
            {totalVat.toLocaleString('ko-KR')}
            <span className="text-xs font-sans text-neutral-500 font-normal ml-1">원</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            공급가액: {totalSupply.toLocaleString('ko-KR')}원
          </div>
        </div>
      </div>

      {/* Category breakdown bar if data exists */}
      {totalAmount > 0 && sortedCategories.length > 0 && (
        <div className="p-3.5 bg-white border border-neutral-200 rounded-lg text-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2 font-medium text-[11px]">
            <span>계정과목별 지출 비중</span>
            <span>최다 지출: {sortedCategories[0][0]}</span>
          </div>

          {/* Progress bar segments */}
          <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden flex">
            {sortedCategories.map(([cat, amt], i) => {
              const pct = (amt / totalAmount) * 100;
              const colors = [
                'bg-emerald-600',
                'bg-blue-600',
                'bg-amber-500',
                'bg-purple-600',
                'bg-rose-500',
                'bg-neutral-400',
              ];
              const color = colors[i % colors.length];
              return (
                <div
                  key={cat}
                  style={{ width: `${pct}%` }}
                  className={`${color} h-full transition-all`}
                  title={`${cat}: ${amt.toLocaleString()}원 (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px] text-neutral-600">
            {sortedCategories.slice(0, 4).map(([cat, amt], i) => {
              const pct = Math.round((amt / totalAmount) * 100);
              const dots = [
                'bg-emerald-600',
                'bg-blue-600',
                'bg-amber-500',
                'bg-purple-600',
              ];
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dots[i % dots.length]}`} />
                  <span className="font-medium text-neutral-800">{cat}</span>
                  <span className="text-neutral-500 font-mono tabular-nums">{amt.toLocaleString()}원 ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
