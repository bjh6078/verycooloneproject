import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Copy,
  MessageSquareText,
  FileDown,
  RotateCcw,
} from 'lucide-react';

interface ExpenseHeaderProps {
  currentMonth: string;
  activeView: 'ledger' | 'print';
  setActiveView: (view: 'ledger' | 'print') => void;
  onOpenSmsModal: () => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onCopyClipboard: () => void;
  onResetSample: () => void;
  copiedNotification: boolean;
}

export const ExpenseHeader: React.FC<ExpenseHeaderProps> = ({
  currentMonth,
  activeView,
  setActiveView,
  onOpenSmsModal,
  onExportExcel,
  onExportCsv,
  onCopyClipboard,
  onResetSample,
  copiedNotification,
}) => {
  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-700 text-white rounded-md flex items-center justify-center font-bold shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <a href="/" className="text-base font-bold tracking-tight text-neutral-900 block leading-tight">
              스마트 지출결의서
            </a>
            <span className="text-xs text-neutral-500 hidden sm:block">
              영수증 경비 정산 & 세무·회계 엑셀 생성기
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links & View Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
          <button
            onClick={() => setActiveView('ledger')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === 'ledger'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            정산 대장 편집
          </button>
          <button
            onClick={() => setActiveView('print')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'print'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 결재 양식 인쇄</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSmsModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
            title="카드 결제 문자나 카톡 영수증을 여러 건 붙여넣어 일괄 등록"
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>문자 일괄 등록</span>
          </button>

          <button
            onClick={onCopyClipboard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-md transition-colors"
            title="구글 시트나 엑셀에 바로 붙여넣기 (TSV)"
          >
            <Copy className="w-3.5 h-3.5 text-neutral-500" />
            <span>{copiedNotification ? '복사 완료!' : '복사'}</span>
          </button>

          <button
            onClick={onExportCsv}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-md transition-colors"
            title="한글 깨짐 없는 UTF-8 BOM CSV 파일"
          >
            <FileDown className="w-3.5 h-3.5 text-neutral-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-xs"
            title="결재란과 집계표가 포함된 공식 엑셀(.xlsx) 파일 즉시 다운로드"
          >
            <Download className="w-3.5 h-3.5" />
            <span>엑셀 다운로드 (.xlsx)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
