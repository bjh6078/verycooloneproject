import React, { useState, useEffect } from 'react';
import { ExpenseItem, ExpenseReportHeader } from './types/expense';
import { DEFAULT_REPORT_HEADER, DEFAULT_EXPENSE_ITEMS } from './data/defaultExpenses';
import {
  exportExpenseReportToExcel,
  exportExpenseReportToCsv,
  copyExpenseReportToClipboard,
} from './utils/expenseExcel';
import { ExpenseHeader } from './components/ExpenseHeader';
import { ReportHeaderCard } from './components/ReportHeaderCard';
import { ExpenseQuickStats } from './components/ExpenseQuickStats';
import { ExpenseEntryForm } from './components/ExpenseEntryForm';
import { ExpenseLedgerTable } from './components/ExpenseLedgerTable';
import { PrintReportView } from './components/PrintReportView';
import { SmartSmsModal } from './components/SmartSmsModal';
import { Check, Info, ShieldCheck, Sparkles, ReceiptText } from 'lucide-react';

const STORAGE_KEY_HEADER = 'smart_expense_header_v2';
const STORAGE_KEY_ITEMS = 'smart_expense_items_v2';

export default function App() {
  // Load Header
  const [header, setHeader] = useState<ExpenseReportHeader>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HEADER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_REPORT_HEADER;
  });

  // Load Expense Items
  const [items, setItems] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_EXPENSE_ITEMS;
  });

  const [activeView, setActiveView] = useState<'ledger' | 'print'>('ledger');
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // LocalStorage Sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HEADER, JSON.stringify(header));
  }, [header]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  // Next receipt number
  const nextReceiptNo = items.length > 0 ? Math.max(...items.map((it) => it.receiptNumber || 0)) + 1 : 1;

  // Add Item
  const handleAddExpense = (itemData: Omit<ExpenseItem, 'id' | 'receiptNumber'>) => {
    const newItem: ExpenseItem = {
      ...itemData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      receiptNumber: nextReceiptNo,
    };
    setItems((prev) => [newItem, ...prev]);
  };

  // Add Multiple Items (from SMS modal)
  const handleAddMultiple = (newItems: Omit<ExpenseItem, 'id' | 'receiptNumber'>[]) => {
    let currentNo = nextReceiptNo;
    const mapped: ExpenseItem[] = newItems.map((it, idx) => ({
      ...it,
      id: `bulk-${Date.now()}-${idx}`,
      receiptNumber: currentNo++,
    }));
    setItems((prev) => [...mapped, ...prev]);
    setStatusNotification(`${mapped.length}건의 영수증이 정산 대장에 추가되었습니다.`);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Update Item
  const handleUpdateItem = (id: string, updates: Partial<ExpenseItem>) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updated = { ...it, ...updates };
          if (updates.totalAmount !== undefined) {
            updated.supplyAmount = updated.hasVat ? Math.round(updated.totalAmount / 1.1) : updated.totalAmount;
            updated.vatAmount = updated.totalAmount - updated.supplyAmount;
          }
          return updated;
        }
        return it;
      })
    );
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Duplicate Item
  const handleDuplicateItem = (id: string) => {
    const target = items.find((it) => it.id === id);
    if (!target) return;
    const duplicated: ExpenseItem = {
      ...target,
      id: `dup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      receiptNumber: nextReceiptNo,
      purpose: `${target.purpose} (복제)`,
    };
    setItems((prev) => [duplicated, ...prev]);
  };

  // Delete Selected
  const handleDeleteSelected = (ids: string[]) => {
    const idSet = new Set(ids);
    setItems((prev) => prev.filter((it) => !idSet.has(it.id)));
  };

  // Reset to Sample
  const handleResetSample = () => {
    setItems([...DEFAULT_EXPENSE_ITEMS]);
    setHeader({ ...DEFAULT_REPORT_HEADER });
    setStatusNotification('기본 실무 샘플 데이터로 복구되었습니다.');
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Clear All
  const handleClearAll = () => {
    if (window.confirm('정산 대장의 모든 영수증 내역을 삭제하시겠습니까?')) {
      setItems([]);
      setStatusNotification('모든 영수증 내역이 초기화되었습니다.');
      setTimeout(() => setStatusNotification(null), 3000);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    if (items.length === 0) {
      alert('출력할 영수증 내역이 없습니다.');
      return;
    }
    exportExpenseReportToExcel(header, items);
    setStatusNotification('결재란 및 집계표가 포함된 엑셀(.xlsx) 파일이 다운로드되었습니다.');
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (items.length === 0) {
      alert('출력할 영수증 내역이 없습니다.');
      return;
    }
    exportExpenseReportToCsv(header, items);
    setStatusNotification('한글 깨짐 없는 UTF-8 BOM CSV 파일이 다운로드되었습니다.');
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Copy Clipboard
  const handleCopyClipboard = async () => {
    if (items.length === 0) return;
    const success = await copyExpenseReportToClipboard(header, items);
    if (success) {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 flex flex-col font-sans">
      {/* 3-Zone Header */}
      <ExpenseHeader
        currentMonth={header.reportMonth}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSmsModal={() => setIsSmsModalOpen(true)}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onCopyClipboard={handleCopyClipboard}
        onResetSample={handleResetSample}
        copiedNotification={copiedNotification}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Notification Toast */}
        {statusNotification && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between shadow-2xs">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>{statusNotification}</span>
            </span>
            <span className="text-[11px] text-emerald-600">브라우저 다운로드 폴더를 확인하세요</span>
          </div>
        )}

        {/* View Mode: Ledger Edit */}
        {activeView === 'ledger' && (
          <div className="space-y-6">
            {/* Applicant & Settlement Setting Card */}
            <ReportHeaderCard
              header={header}
              onChangeHeader={(updates) => setHeader((prev) => ({ ...prev, ...updates }))}
            />

            {/* Quick Metrics (Highlighting personal reimbursement) */}
            <ExpenseQuickStats items={items} />

            {/* Fast Entry Form with SMS auto-parse & VAT calculation */}
            <ExpenseEntryForm
              onAddExpense={handleAddExpense}
              nextReceiptNo={nextReceiptNo}
            />

            {/* High-density Spreadsheet Table with Inline Edit */}
            <ExpenseLedgerTable
              items={items}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onDuplicateItem={handleDuplicateItem}
              onDeleteSelected={handleDeleteSelected}
              onResetSample={handleResetSample}
              onClearAll={handleClearAll}
            />

            {/* Practical Guide for Accounting Submission */}
            <div className="p-4 sm:p-5 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-600 space-y-3">
              <div className="flex items-center gap-2 text-neutral-900 font-semibold text-sm">
                <ReceiptText className="w-4 h-4 text-emerald-700" />
                <span>회사 회계팀 & 세무사 제출용 엑셀 변환 가이드</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1">
                  <div className="font-semibold text-neutral-800">1. 결재란 & 2개 시트 동시 생성</div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    다운로드된 <code>.xlsx</code> 파일은 <strong>[지출결의서]</strong>(결재란, 계좌정보, 계정과목별 집계표 포함) 시트와 ERP 일괄 업로드용 <strong>[ERP_원장데이터]</strong> 시트가 함께 들어있어 보고와 전산 처리가 한 번에 끝납니다.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-neutral-800">2. 부가세 매입세액 자동 분리</div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    지출금액을 입력하면 공급가액과 부가세(10%)가 자동으로 분리되어 부가세 신고 시 세액 공제 항목을 놓치지 않고 100% 챙길 수 있습니다.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-neutral-800">3. 개인카드 사후 환급액 집계</div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    회사 법인카드 사용분과 직원이 개인카드로 먼저 긁은 사후정산 금액을 자동으로 분리 집계하여 통장으로 돌려받아야 할 실비 금액을 명확하게 증명합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode: A4 Printable Report */}
        {activeView === 'print' && (
          <PrintReportView
            header={header}
            items={items}
            onBackToLedger={() => setActiveView('ledger')}
            onExportExcel={handleExportExcel}
          />
        )}
      </main>

      {/* Bulk SMS / Push Message Parser Modal */}
      <SmartSmsModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        onAddMultiple={handleAddMultiple}
      />
    </div>
  );
}
