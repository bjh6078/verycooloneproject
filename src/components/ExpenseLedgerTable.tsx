import React, { useState, useMemo } from 'react';
import {
  ExpenseItem,
  ExpenseCategory,
  PaymentMethod,
  DEFAULT_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
} from '../types/expense';
import {
  Search,
  Trash2,
  Copy,
  ArrowUpDown,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Filter,
} from 'lucide-react';

interface ExpenseLedgerTableProps {
  items: ExpenseItem[];
  onUpdateItem: (id: string, updates: Partial<ExpenseItem>) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onResetSample: () => void;
  onClearAll: () => void;
}

export const ExpenseLedgerTable: React.FC<ExpenseLedgerTableProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onDeleteSelected,
  onResetSample,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'totalAmount' | 'receiptNumber'>('date');
  const [sortAsc, setSortAsc] = useState(false); // default descending (newest first)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof ExpenseItem } | null>(
    null
  );
  const [editValue, setEditValue] = useState<string>('');

  // Handle Sort
  const handleSort = (field: 'date' | 'totalAmount' | 'receiptNumber') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'receiptNumber' ? true : false);
    }
  };

  // Filtered & Sorted Items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((it) => it.category === filterCategory);
    }

    // Payment method filter
    if (filterPayment !== 'all') {
      result = result.filter((it) => it.paymentMethod === filterPayment);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (it) =>
          it.merchant.toLowerCase().includes(q) ||
          it.purpose.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q) ||
          it.paymentMethod.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'totalAmount' || sortField === 'receiptNumber') {
        return sortAsc ? valA - valB : valB - valA;
      }
      // date string comparison
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    return result;
  }, [items, searchQuery, filterCategory, filterPayment, sortField, sortAsc]);

  // Inline editing
  const startEditing = (id: string, field: keyof ExpenseItem, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : '');
  };

  const saveEditing = () => {
    if (!editingCell) return;
    const { id, field } = editingCell;
    const target = items.find((it) => it.id === id);
    if (!target) {
      setEditingCell(null);
      return;
    }

    const updates: Partial<ExpenseItem> = {};

    if (field === 'totalAmount') {
      const num = Number(editValue) || 0;
      updates.totalAmount = num;
      updates.supplyAmount = target.hasVat ? Math.round(num / 1.1) : num;
      updates.vatAmount = num - updates.supplyAmount;
    } else {
      (updates as Record<string, any>)[field] = editValue;
    }

    onUpdateItem(id, updates);
    setEditingCell(null);
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((it) => it.id)));
    }
  };

  const isAllSelected = filteredItems.length > 0 && selectedIds.size === filteredItems.length;

  // Subtotals of current view
  const viewTotalAmount = filteredItems.reduce((acc, it) => acc + (it.totalAmount || 0), 0);

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-3.5 sm:p-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="상호명, 비고, 계정과목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 w-full text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-8 px-2 text-xs bg-white border border-neutral-300 rounded focus:outline-none text-neutral-700"
          >
            <option value="all">전체 계정과목</option>
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="h-8 px-2 text-xs bg-white border border-neutral-300 rounded focus:outline-none text-neutral-700"
          >
            <option value="all">전체 결제수단</option>
            {DEFAULT_PAYMENT_METHODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {selectedIds.size > 0 && (
            <button
              onClick={() => {
                onDeleteSelected(Array.from(selectedIds));
                setSelectedIds(new Set());
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>선택 {selectedIds.size}건 삭제</span>
            </button>
          )}
        </div>

        {/* Counter & Status */}
        <div className="text-xs text-neutral-500 flex items-center justify-between sm:justify-end gap-3">
          <span>
            조회 <strong className="text-neutral-900">{filteredItems.length}</strong>건 (합계:{' '}
            <strong className="text-emerald-800 font-mono tabular-nums">
              {viewTotalAmount.toLocaleString()}원
            </strong>
            )
          </span>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto min-h-[300px] max-h-[580px] border-b border-neutral-200">
        <table className="w-full text-left text-xs border-collapse">
          {/* Header */}
          <thead className="bg-neutral-100 sticky top-0 z-10 text-neutral-700 font-medium select-none shadow-2xs">
            <tr className="border-b border-neutral-200">
              <th className="w-10 px-3 py-2 text-center border-r border-neutral-200 bg-neutral-100">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center justify-center w-full text-neutral-500 hover:text-neutral-900"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>
              </th>
              <th
                onClick={() => handleSort('receiptNumber')}
                className="w-16 px-2 py-2 text-center border-r border-neutral-200 cursor-pointer hover:bg-neutral-200/70"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>증빙 No</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('date')}
                className="w-24 px-3 py-2 border-r border-neutral-200 cursor-pointer hover:bg-neutral-200/70"
              >
                <div className="flex items-center justify-between gap-1">
                  <span>사용일자</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th className="px-3 py-2 border-r border-neutral-200 min-w-[140px]">
                사용처 (상호명)
              </th>
              <th className="px-3 py-2 border-r border-neutral-200 min-w-[110px]">계정과목</th>
              <th className="px-3 py-2 border-r border-neutral-200 min-w-[120px]">결제수단</th>
              <th className="px-3 py-2 text-right border-r border-neutral-200 min-w-[90px]">
                공급가액(원)
              </th>
              <th className="px-3 py-2 text-right border-r border-neutral-200 min-w-[80px]">
                부가세(원)
              </th>
              <th
                onClick={() => handleSort('totalAmount')}
                className="px-3 py-2 text-right border-r border-neutral-200 min-w-[100px] cursor-pointer hover:bg-neutral-200/70"
              >
                <div className="flex items-center justify-end gap-1 font-semibold text-neutral-900">
                  <span>지출총액(원)</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th className="px-3 py-2 border-r border-neutral-200 min-w-[100px]">증빙구분</th>
              <th className="px-3 py-2 border-r border-neutral-200 min-w-[160px]">
                사용목적 및 비고
              </th>
              <th className="w-20 px-2 py-2 text-center bg-neutral-100">관리</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-neutral-200 bg-white">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-16 text-center text-neutral-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileSpreadsheet className="w-8 h-8 text-neutral-300" />
                    <p className="text-sm font-medium text-neutral-600">등록된 지출 내역이 없습니다.</p>
                    <p className="text-xs text-neutral-400 max-w-sm">
                      상단 입력 폼을 통해 영수증을 등록하거나 샘플 데이터를 불러와 실무 엑셀을 확인해보세요.
                    </p>
                    <button
                      onClick={onResetSample}
                      className="mt-2 px-3 py-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                    >
                      실무 예시 데이터 불러오기
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = selectedIds.has(item.id);
                const isPersonal = item.paymentMethod.includes('개인카드') || item.paymentMethod === '계좌이체';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-neutral-50 transition-colors ${
                      isSelected ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="w-10 px-3 py-2 text-center border-r border-neutral-200">
                      <button
                        type="button"
                        onClick={() => toggleSelect(item.id)}
                        className="flex items-center justify-center w-full text-neutral-400 hover:text-neutral-900"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                    {/* Receipt No */}
                    <td className="w-16 px-2 py-2 text-center text-xs font-mono font-medium text-neutral-600 border-r border-neutral-200">
                      No.{item.receiptNumber || idx + 1}
                    </td>

                    {/* Date */}
                    <td
                      onDoubleClick={() => startEditing(item.id, 'date', item.date)}
                      className="px-3 py-2 font-mono tabular-nums text-neutral-700 border-r border-neutral-200 whitespace-nowrap cursor-pointer hover:bg-neutral-100/50"
                    >
                      {editingCell?.id === item.id && editingCell?.field === 'date' ? (
                        <input
                          autoFocus
                          type="date"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEditing}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                          className="h-7 px-1 text-xs border-2 border-emerald-600 rounded-none w-full"
                        />
                      ) : (
                        item.date
                      )}
                    </td>

                    {/* Merchant */}
                    <td
                      onDoubleClick={() => startEditing(item.id, 'merchant', item.merchant)}
                      className="px-3 py-2 font-medium text-neutral-900 border-r border-neutral-200 whitespace-nowrap cursor-pointer hover:bg-neutral-100/50"
                    >
                      {editingCell?.id === item.id && editingCell?.field === 'merchant' ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEditing}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                          className="h-7 px-1 text-xs border-2 border-emerald-600 rounded-none w-full"
                        />
                      ) : (
                        item.merchant
                      )}
                    </td>

                    {/* Category */}
                    <td
                      onDoubleClick={() => startEditing(item.id, 'category', item.category)}
                      className="px-3 py-2 text-neutral-700 border-r border-neutral-200 whitespace-nowrap cursor-pointer hover:bg-neutral-100/50"
                    >
                      {editingCell?.id === item.id && editingCell?.field === 'category' ? (
                        <select
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEditing}
                          className="h-7 px-1 text-xs border-2 border-emerald-600 rounded-none w-full"
                        >
                          {DEFAULT_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      ) : (
                        item.category
                      )}
                    </td>

                    {/* Payment Method */}
                    <td
                      onDoubleClick={() => startEditing(item.id, 'paymentMethod', item.paymentMethod)}
                      className="px-3 py-2 text-neutral-700 border-r border-neutral-200 whitespace-nowrap cursor-pointer hover:bg-neutral-100/50"
                    >
                      {editingCell?.id === item.id && editingCell?.field === 'paymentMethod' ? (
                        <select
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEditing}
                          className="h-7 px-1 text-xs border-2 border-emerald-600 rounded-none w-full"
                        >
                          {DEFAULT_PAYMENT_METHODS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={isPersonal ? 'text-emerald-800 font-medium' : 'text-neutral-700'}>
                          {item.paymentMethod}
                        </span>
                      )}
                    </td>

                    {/* Supply Amount */}
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-neutral-600 border-r border-neutral-200 whitespace-nowrap">
                      {item.supplyAmount.toLocaleString()}
                    </td>

                    {/* VAT Amount */}
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-neutral-500 border-r border-neutral-200 whitespace-nowrap">
                      {item.vatAmount.toLocaleString()}
                    </td>

                    {/* Total Amount */}
                    <td
                      onDoubleClick={() => startEditing(item.id, 'totalAmount', item.totalAmount)}
                      className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-neutral-900 border-r border-neutral-200 whitespace-nowrap cursor-pointer hover:bg-neutral-100/50"
                    >
                      {editingCell?.id === item.id && editingCell?.field === 'totalAmount' ? (
                        <input
                          autoFocus
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEditing}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                          className="h-7 px-1 text-xs border-2 border-emerald-600 rounded-none w-full text-right"
                        />
                      ) : (
                        item.totalAmount.toLocaleString()
                      )}
                    </td>

                    {/* Receipt Type */}
                    <td className="px-3 py-2 text-neutral-600 border-r border-neutral-200 whitespace-nowrap text-[11px]">
                      {item.receiptType}
                    </td>

                    {/* Purpose / Notes */}
                    <td
                      onDoubleClick={() => startEditing(item.id, 'purpose', item.purpose)}
                      className="px-3 py-2 text-neutral-600 border-r border-neutral-200 max-w-xs truncate cursor-pointer hover:bg-neutral-100/50"
                    >
                      {editingCell?.id === item.id && editingCell?.field === 'purpose' ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEditing}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                          className="h-7 px-1 text-xs border-2 border-emerald-600 rounded-none w-full"
                        />
                      ) : (
                        item.purpose || '-'
                      )}
                    </td>

                    {/* Actions */}
                    <td className="w-20 px-2 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDuplicateItem(item.id)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 rounded"
                          title="이 항목 복제"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 text-neutral-400 hover:text-red-600 rounded"
                          title="이 항목 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-2.5 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
        <div>
          <span>* 셀을 더블클릭하면 즉시 편집할 수 있습니다. (금액 수정 시 공급가·부가세 자동 갱신)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onResetSample}
            className="text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
          >
            기본 샘플 복구
          </button>
          <span>·</span>
          <button
            onClick={onClearAll}
            className="text-red-500 hover:text-red-700 underline underline-offset-2"
          >
            전체 비우기
          </button>
        </div>
      </div>
    </div>
  );
};
