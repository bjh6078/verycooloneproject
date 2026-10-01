import React from 'react';
import { ExpenseReportHeader, ExpenseItem } from '../types/expense';
import { Printer, ArrowLeft, Download } from 'lucide-react';

interface PrintReportViewProps {
  header: ExpenseReportHeader;
  items: ExpenseItem[];
  onBackToLedger: () => void;
  onExportExcel: () => void;
}

/**
 * Converts number to Korean currency string (e.g. 48,000 -> 사만팔천원정)
 */
function toKoreanCurrencyText(num: number): string {
  if (num === 0) return '영원정';
  const units = ['', '만', '억', '조'];
  const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  let result = '';
  let unitIdx = 0;
  let temp = num;

  while (temp > 0) {
    const chunk = temp % 10000;
    if (chunk > 0) {
      let chunkStr = '';
      const c1000 = Math.floor(chunk / 1000);
      const c100 = Math.floor((chunk % 1000) / 100);
      const c10 = Math.floor((chunk % 100) / 10);
      const c1 = chunk % 10;

      if (c1000 > 0) chunkStr += (c1000 === 1 ? '' : digits[c1000]) + '천';
      if (c100 > 0) chunkStr += (c100 === 1 ? '' : digits[c100]) + '백';
      if (c10 > 0) chunkStr += (c10 === 1 ? '' : digits[c10]) + '십';
      if (c1 > 0) chunkStr += digits[c1];

      result = chunkStr + units[unitIdx] + ' ' + result;
    }
    temp = Math.floor(temp / 10000);
    unitIdx++;
  }

  return `일금 ${result.trim()}원정`;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  header,
  items,
  onBackToLedger,
  onExportExcel,
}) => {
  const totalAmount = items.reduce((acc, it) => acc + (it.totalAmount || 0), 0);
  const totalSupply = items.reduce((acc, it) => acc + (it.supplyAmount || 0), 0);
  const totalVat = items.reduce((acc, it) => acc + (it.vatAmount || 0), 0);

  const personalReimburse = items
    .filter((it) => it.paymentMethod.includes('개인카드') || it.paymentMethod === '계좌이체')
    .reduce((acc, it) => acc + (it.totalAmount || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg print:hidden">
        <button
          onClick={onBackToLedger}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>정산 대장 편집으로 돌아가기</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>엑셀(.xlsx) 저장</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>A4 결재 양식 인쇄 (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* Official A4 Expense Report Paper Sheet */}
      <div className="bg-white border border-neutral-300 shadow-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0 text-neutral-900">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-widest border-b-2 border-neutral-900 pb-2 inline-block px-8">
            지 출 결 의 서
          </h1>
          <p className="text-xs text-neutral-500 mt-1.5">
            [ 정산 대상월: {header.reportMonth} ]
          </p>
        </div>

        {/* Top Split: Left Applicant Info, Right Approval Box */}
        <div className="flex items-start justify-between gap-4 mb-6">
          {/* Applicant Info Table */}
          <div className="flex-1">
            <table className="w-full text-xs border-collapse border border-neutral-400">
              <tbody>
                <tr>
                  <th className="bg-neutral-100 border border-neutral-400 px-3 py-1.5 text-left w-20 font-medium">
                    기안부서
                  </th>
                  <td className="border border-neutral-400 px-3 py-1.5">{header.department || '-'}</td>
                  <th className="bg-neutral-100 border border-neutral-400 px-3 py-1.5 text-left w-20 font-medium">
                    직 급
                  </th>
                  <td className="border border-neutral-400 px-3 py-1.5">{header.position || '-'}</td>
                </tr>
                <tr>
                  <th className="bg-neutral-100 border border-neutral-400 px-3 py-1.5 text-left font-medium">
                    기안자
                  </th>
                  <td className="border border-neutral-400 px-3 py-1.5 font-semibold">
                    {header.applicantName || '-'} (인)
                  </td>
                  <th className="bg-neutral-100 border border-neutral-400 px-3 py-1.5 text-left font-medium">
                    기안일자
                  </th>
                  <td className="border border-neutral-400 px-3 py-1.5 font-mono">
                    {new Date().toISOString().slice(0, 10)}
                  </td>
                </tr>
                <tr>
                  <th className="bg-neutral-100 border border-neutral-400 px-3 py-1.5 text-left font-medium">
                    입금계좌
                  </th>
                  <td colSpan={3} className="border border-neutral-400 px-3 py-1.5">
                    {header.bankName} {header.accountNumber || '-'} (예금주: {header.applicantName})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Approval Stamp Box */}
          {header.includeApprovalBox && (
            <div className="w-48 shrink-0">
              <table className="w-full text-center text-xs border-collapse border border-neutral-400">
                <thead>
                  <tr className="bg-neutral-100">
                    <th rowSpan={2} className="w-7 border border-neutral-400 py-1 font-medium text-[11px] leading-tight">
                      결<br />재
                    </th>
                    <th className="border border-neutral-400 py-1 font-medium text-[11px]">담당</th>
                    <th className="border border-neutral-400 py-1 font-medium text-[11px]">검토</th>
                    <th className="border border-neutral-400 py-1 font-medium text-[11px]">승인</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-14">
                    <td className="border border-neutral-400"></td>
                    <td className="border border-neutral-400"></td>
                    <td className="border border-neutral-400"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Amount Box */}
        <div className="p-3 bg-neutral-50 border border-neutral-400 rounded-none mb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-700 mr-2">결의 총금액:</span>
            <span className="text-base font-bold text-neutral-900 mr-3">
              {toKoreanCurrencyText(totalAmount)}
            </span>
            <span className="text-sm font-bold font-mono text-neutral-900">
              (₩{totalAmount.toLocaleString()}원)
            </span>
          </div>
          <div className="text-xs text-neutral-600 font-mono">
            <span>[개인 환급 청구액: {personalReimburse.toLocaleString()}원]</span>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="w-full text-xs border-collapse border border-neutral-400 mb-6">
          <thead className="bg-neutral-100 text-neutral-800">
            <tr>
              <th className="border border-neutral-400 px-2 py-1.5 w-10 text-center font-medium">No</th>
              <th className="border border-neutral-400 px-2 py-1.5 w-20 text-center font-medium">사용일자</th>
              <th className="border border-neutral-400 px-2 py-1.5 text-left font-medium">사용처(상호명)</th>
              <th className="border border-neutral-400 px-2 py-1.5 text-center font-medium w-24">계정과목</th>
              <th className="border border-neutral-400 px-2 py-1.5 text-center font-medium w-24">결제수단</th>
              <th className="border border-neutral-400 px-2 py-1.5 text-right font-medium w-20">공급가액</th>
              <th className="border border-neutral-400 px-2 py-1.5 text-right font-medium w-16">부가세</th>
              <th className="border border-neutral-400 px-2 py-1.5 text-right font-medium w-24">지출총액</th>
              <th className="border border-neutral-400 px-2 py-1.5 text-left font-medium">사용목적 및 비고</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id} className="border-b border-neutral-400">
                <td className="border border-neutral-400 px-2 py-1.5 text-center font-mono">{idx + 1}</td>
                <td className="border border-neutral-400 px-2 py-1.5 text-center font-mono">{it.date}</td>
                <td className="border border-neutral-400 px-2 py-1.5 font-medium">{it.merchant}</td>
                <td className="border border-neutral-400 px-2 py-1.5 text-center">{it.category}</td>
                <td className="border border-neutral-400 px-2 py-1.5 text-center">{it.paymentMethod}</td>
                <td className="border border-neutral-400 px-2 py-1.5 text-right font-mono">
                  {it.supplyAmount.toLocaleString()}
                </td>
                <td className="border border-neutral-400 px-2 py-1.5 text-right font-mono">
                  {it.vatAmount.toLocaleString()}
                </td>
                <td className="border border-neutral-400 px-2 py-1.5 text-right font-mono font-semibold">
                  {it.totalAmount.toLocaleString()}
                </td>
                <td className="border border-neutral-400 px-2 py-1.5">{it.purpose}</td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-neutral-100 font-semibold border-t-2 border-neutral-900">
              <td colSpan={5} className="border border-neutral-400 px-3 py-2 text-center">
                합 계 (총 {items.length}건)
              </td>
              <td className="border border-neutral-400 px-2 py-2 text-right font-mono">
                {totalSupply.toLocaleString()}
              </td>
              <td className="border border-neutral-400 px-2 py-2 text-right font-mono">
                {totalVat.toLocaleString()}
              </td>
              <td className="border border-neutral-400 px-2 py-2 text-right font-mono text-emerald-900">
                {totalAmount.toLocaleString()}원
              </td>
              <td className="border border-neutral-400 px-2 py-2 text-center text-neutral-500 font-normal">
                영수증 원본 별첨
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer Notes & Sign-off */}
        <div className="pt-4 border-t border-neutral-300 text-xs text-neutral-600 flex flex-col items-center justify-center space-y-4 text-center">
          <p>
            위와 같이 업무 수행에 수반하여 정당하게 지출하였음을 확인하며 영수증을 첨부하여 결의합니다.
          </p>
          <div className="font-semibold text-neutral-900 text-sm">
            기안자: {header.applicantName || '홍길동'} (인 / 서명)
          </div>
        </div>
      </div>
    </div>
  );
};
