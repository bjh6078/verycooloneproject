import * as XLSX from 'xlsx';
import { ExpenseItem, ExpenseReportHeader } from '../types/expense';

/**
 * Calculates responsive column widths for an XLSX worksheet.
 */
function getAutoWidths(data: any[][]): { wch: number }[] {
  const colCount = Math.max(...data.map((row) => (row ? row.length : 0)));
  const widths: { wch: number }[] = [];

  for (let c = 0; c < colCount; c++) {
    let maxLen = 8;
    for (let r = 0; r < data.length; r++) {
      const val = data[r] ? data[r][c] : undefined;
      if (val !== undefined && val !== null) {
        const str = String(val);
        let len = 0;
        for (let i = 0; i < str.length; i++) {
          len += str.charCodeAt(i) > 127 ? 2 : 1;
        }
        if (len > maxLen) maxLen = len;
      }
    }
    widths.push({ wch: Math.min(Math.max(maxLen + 3, 10), 45) });
  }

  return widths;
}

/**
 * Generates an official, beautifully structured Excel workbook with 2 sheets:
 * 1. "지출결의서" (Formally formatted report with approval boxes, summaries, and sub-totals)
 * 2. "ERP_원장데이터" (Standard flat table ready for accounting software upload)
 */
export function exportExpenseReportToExcel(
  header: ExpenseReportHeader,
  items: ExpenseItem[],
  customFilename?: string
): void {
  const workbook = XLSX.utils.book_new();

  // --- SHEET 1: 지출결의서 (Official Report Format) ---
  const sheet1Data: any[][] = [];

  // Title
  sheet1Data.push([header.title || `${header.reportMonth} 경비 지출 결의서`]);
  sheet1Data.push([]); // blank

  // Applicant info & Approval Box Header
  const todayStr = new Date().toISOString().slice(0, 10);
  if (header.includeApprovalBox) {
    sheet1Data.push(['[ 기 안 정 보 ]', '', '', '', '', '', '[ 결 재 란 ]', '', '']);
    sheet1Data.push(['기안일자', todayStr, '기안자', header.applicantName, '', '', '기안', '검토', '승인']);
    sheet1Data.push(['소속부서', header.department, '직급', header.position, '', '', '', '', '']);
    sheet1Data.push(['입금계좌', `${header.bankName} ${header.accountNumber}`, '정산월', header.reportMonth, '', '', '', '', '']);
  } else {
    sheet1Data.push(['[ 기 안 정 보 ]', '']);
    sheet1Data.push(['기안일자', todayStr, '기안자', header.applicantName]);
    sheet1Data.push(['소속부서', header.department, '직급', header.position]);
    sheet1Data.push(['입금계좌', `${header.bankName} ${header.accountNumber}`, '정산월', header.reportMonth]);
  }
  sheet1Data.push([]); // blank

  // Summary Totals
  const totalAmount = items.reduce((acc, it) => acc + (Number(it.totalAmount) || 0), 0);
  const totalSupply = items.reduce((acc, it) => acc + (Number(it.supplyAmount) || 0), 0);
  const totalVat = items.reduce((acc, it) => acc + (Number(it.vatAmount) || 0), 0);
  const personalReimburse = items
    .filter((it) => it.paymentMethod.includes('개인카드') || it.paymentMethod === '계좌이체')
    .reduce((acc, it) => acc + (Number(it.totalAmount) || 0), 0);
  const corporateCard = items
    .filter((it) => it.paymentMethod === '법인카드')
    .reduce((acc, it) => acc + (Number(it.totalAmount) || 0), 0);

  sheet1Data.push([
    '■ 총 결의 금액',
    `총 합계: ${totalAmount.toLocaleString('ko-KR')}원`,
    `공급가액: ${totalSupply.toLocaleString('ko-KR')}원`,
    `부가세: ${totalVat.toLocaleString('ko-KR')}원`,
    '',
    `[개인 실비 청구액: ${personalReimburse.toLocaleString('ko-KR')}원]`,
    `[법인카드 사용액: ${corporateCard.toLocaleString('ko-KR')}원]`,
  ]);
  sheet1Data.push([]); // blank

  // Table Headers
  const tableHeaders = [
    '증빙 No',
    '사용일자',
    '사용처 (상호명)',
    '계정과목',
    '결제수단',
    '공급가액(원)',
    '부가세(원)',
    '지출총액(원)',
    '증빙구분',
    '사용목적 및 비고',
  ];
  sheet1Data.push(tableHeaders);

  // Table Rows
  items.forEach((item, idx) => {
    sheet1Data.push([
      item.receiptNumber || idx + 1,
      item.date,
      item.merchant,
      item.category,
      item.paymentMethod,
      item.supplyAmount,
      item.vatAmount,
      item.totalAmount,
      item.receiptType,
      item.purpose || '',
    ]);
  });

  // Table Total Row
  sheet1Data.push([
    '합계',
    '',
    `${items.length}건`,
    '',
    '',
    totalSupply,
    totalVat,
    totalAmount,
    '',
    '',
  ]);

  sheet1Data.push([]); // blank
  sheet1Data.push(['■ 계정과목별 집계 요약', '', '', '', '■ 결제수단별 집계 요약']);

  // Category subtotals
  const categoryMap: Record<string, number> = {};
  items.forEach((it) => {
    categoryMap[it.category] = (categoryMap[it.category] || 0) + it.totalAmount;
  });

  const paymentMap: Record<string, number> = {};
  items.forEach((it) => {
    paymentMap[it.paymentMethod] = (paymentMap[it.paymentMethod] || 0) + it.totalAmount;
  });

  const catKeys = Object.keys(categoryMap);
  const payKeys = Object.keys(paymentMap);
  const maxSubRows = Math.max(catKeys.length, payKeys.length);

  for (let i = 0; i < maxSubRows; i++) {
    const cat = catKeys[i];
    const catAmt = cat ? categoryMap[cat] : '';
    const pay = payKeys[i];
    const payAmt = pay ? paymentMap[pay] : '';

    sheet1Data.push([
      cat || '',
      catAmt !== '' ? Number(catAmt) : '',
      '',
      '',
      pay || '',
      payAmt !== '' ? Number(payAmt) : '',
    ]);
  }

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  ws1['!cols'] = getAutoWidths(sheet1Data);
  XLSX.utils.book_append_sheet(workbook, ws1, '지출결의서');

  // --- SHEET 2: ERP_원장데이터 (Raw Flat Format for accounting systems) ---
  const sheet2Headers = [
    '증빙번호',
    '일자',
    '거래처명',
    '계정과목',
    '결제구분',
    '공급가액',
    '부가세',
    '합계금액',
    '증빙종류',
    '적요',
    '기안자',
    '부서',
  ];

  const sheet2Rows = items.map((it, idx) => [
    it.receiptNumber || idx + 1,
    it.date,
    it.merchant,
    it.category,
    it.paymentMethod,
    it.supplyAmount,
    it.vatAmount,
    it.totalAmount,
    it.receiptType,
    it.purpose || '',
    header.applicantName || '',
    header.department || '',
  ]);

  const ws2 = XLSX.utils.aoa_to_sheet([sheet2Headers, ...sheet2Rows]);
  ws2['!cols'] = getAutoWidths([sheet2Headers, ...sheet2Rows]);
  XLSX.utils.book_append_sheet(workbook, ws2, 'ERP_원장데이터');

  // File Download
  const filename =
    customFilename ||
    `지출결의서_${header.reportMonth.replace('-', '')}_${header.applicantName || '정산'}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

/**
 * Exports Expense items to UTF-8 BOM CSV.
 */
export function exportExpenseReportToCsv(
  header: ExpenseReportHeader,
  items: ExpenseItem[],
  customFilename?: string
): void {
  const headers = [
    '증빙No',
    '사용일자',
    '사용처(상호명)',
    '계정과목',
    '결제수단',
    '공급가액',
    '부가세',
    '지출총액',
    '증빙구분',
    '사용목적_비고',
  ];

  const rows = items.map((it, idx) => {
    return [
      it.receiptNumber || idx + 1,
      `"${it.date}"`,
      `"${(it.merchant || '').replace(/"/g, '""')}"`,
      `"${(it.category || '').replace(/"/g, '""')}"`,
      `"${(it.paymentMethod || '').replace(/"/g, '""')}"`,
      it.supplyAmount,
      it.vatAmount,
      it.totalAmount,
      `"${(it.receiptType || '').replace(/"/g, '""')}"`,
      `"${(it.purpose || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download =
    customFilename ||
    `지출결의서_${header.reportMonth.replace('-', '')}_${header.applicantName || '정산'}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies the expenses as TSV for immediate Google Sheets / Excel Ctrl+V.
 */
export async function copyExpenseReportToClipboard(
  header: ExpenseReportHeader,
  items: ExpenseItem[]
): Promise<boolean> {
  try {
    const headers = [
      'No',
      '사용일자',
      '사용처',
      '계정과목',
      '결제수단',
      '공급가액',
      '부가세',
      '지출총액',
      '증빙구분',
      '사용목적',
    ].join('\t');

    const lines = items.map((it, idx) =>
      [
        it.receiptNumber || idx + 1,
        it.date,
        it.merchant,
        it.category,
        it.paymentMethod,
        it.supplyAmount,
        it.vatAmount,
        it.totalAmount,
        it.receiptType,
        it.purpose,
      ].join('\t')
    );

    const fullContent = [
      `[${header.title}] 기안자: ${header.applicantName} (${header.department})`,
      headers,
      ...lines,
    ].join('\n');

    await navigator.clipboard.writeText(fullContent);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
