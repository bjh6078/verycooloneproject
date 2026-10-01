import React, { useState } from 'react';
import { ExpenseReportHeader } from '../types/expense';
import { UserCheck, ChevronDown, ChevronUp, Building2, CreditCard } from 'lucide-react';

interface ReportHeaderCardProps {
  header: ExpenseReportHeader;
  onChangeHeader: (updates: Partial<ExpenseReportHeader>) => void;
}

export const ReportHeaderCard: React.FC<ReportHeaderCardProps> = ({
  header,
  onChangeHeader,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-5 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-neutral-900">
                {header.title || '경비 지출 결의서'}
              </h2>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs font-mono font-medium text-emerald-800">
                {header.reportMonth} 정산분
              </span>
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">
              기안자: <strong className="text-neutral-800">{header.applicantName || '미지정'}</strong>
              <span className="mx-1 text-neutral-300">|</span>
              소속: <span className="text-neutral-700">{header.department || '미지정'}</span>
              <span className="mx-1 text-neutral-300">|</span>
              직급: <span className="text-neutral-700">{header.position || '미지정'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <label className="flex items-center gap-1.5 text-xs text-neutral-700 select-none cursor-pointer px-2.5 py-1.5 bg-neutral-50 rounded border border-neutral-200">
            <input
              type="checkbox"
              checked={header.includeApprovalBox}
              onChange={(e) => onChangeHeader({ includeApprovalBox: e.target.checked })}
              className="w-3.5 h-3.5 text-emerald-700 rounded border-neutral-300 focus:ring-emerald-600"
            />
            <span>결재란(기안/검토/승인) 포함</span>
          </label>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded border border-neutral-200 transition-colors"
          >
            <span>{isExpanded ? '정보 접기' : '기안자/계좌 설정'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Form */}
      {isExpanded && (
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-in fade-in duration-150">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">결의서 문서 제목</label>
            <input
              type="text"
              value={header.title}
              onChange={(e) => onChangeHeader({ title: e.target.value })}
              className="w-full h-8 px-2.5 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
              placeholder="예: 2026년 09월 경비 지출 결의서"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">정산 대상 월 (YYYY-MM)</label>
            <input
              type="month"
              value={header.reportMonth}
              onChange={(e) => onChangeHeader({ reportMonth: e.target.value })}
              className="w-full h-8 px-2.5 bg-white border border-neutral-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">기안자 성명</label>
            <input
              type="text"
              value={header.applicantName}
              onChange={(e) => onChangeHeader({ applicantName: e.target.value })}
              className="w-full h-8 px-2.5 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">소속 부서 / 직급</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={header.department}
                onChange={(e) => onChangeHeader({ department: e.target.value })}
                className="w-full h-8 px-2.5 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
                placeholder="개발팀"
              />
              <input
                type="text"
                value={header.position}
                onChange={(e) => onChangeHeader({ position: e.target.value })}
                className="w-full h-8 px-2.5 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
                placeholder="선임연구원"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-neutral-700 mb-1">
              개인 경비 정산 입금 계좌 (은행명 및 계좌번호)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={header.bankName}
                onChange={(e) => onChangeHeader({ bankName: e.target.value })}
                className="w-full h-8 px-2.5 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
                placeholder="신한은행"
              />
              <input
                type="text"
                value={header.accountNumber}
                onChange={(e) => onChangeHeader({ accountNumber: e.target.value })}
                className="col-span-2 w-full h-8 px-2.5 bg-white border border-neutral-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
                placeholder="110-123-456789"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-neutral-700 mb-1">기안 사유 및 특이사항</label>
            <input
              type="text"
              value={header.notes}
              onChange={(e) => onChangeHeader({ notes: e.target.value })}
              className="w-full h-8 px-2.5 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
              placeholder="예: 3분기 프로젝트 개발 및 고객사 현장 지원 관련 경비 일체"
            />
          </div>
        </div>
      )}
    </div>
  );
};
