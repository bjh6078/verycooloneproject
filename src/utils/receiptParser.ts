import { ExpenseCategory, PaymentMethod, ReceiptType } from '../types/expense';

export interface ParsedReceiptResult {
  date: string;
  merchant: string;
  totalAmount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  receiptType: ReceiptType;
  purpose: string;
}

/**
 * Automatically infers Expense Category from merchant name.
 */
export function inferCategory(merchant: string): ExpenseCategory {
  const m = merchant.toLowerCase();

  // Food / Meals / Coffee
  if (
    m.includes('식당') ||
    m.includes('밥') ||
    m.includes('버거') ||
    m.includes('스타벅스') ||
    m.includes('카페') ||
    m.includes('커피') ||
    m.includes('투썸') ||
    m.includes('이디야') ||
    m.includes('식사') ||
    m.includes('김밥') ||
    m.includes('피자') ||
    m.includes('치킨') ||
    m.includes('베이커리') ||
    m.includes('파리바게뜨')
  ) {
    return '식대/복리후생비';
  }

  // Transportation / Fuel
  if (
    m.includes('택시') ||
    m.includes('카카오t') ||
    m.includes('카카오택시') ||
    m.includes('타다') ||
    m.includes('티머니') ||
    m.includes('코레일') ||
    m.includes('srt') ||
    m.includes('주유') ||
    m.includes('gs칼텍스') ||
    m.includes('sk에너지') ||
    m.includes('오일') ||
    m.includes('하이패스') ||
    m.includes('주차')
  ) {
    return '교통비/유류비';
  }

  // Office supplies
  if (
    m.includes('알파') ||
    m.includes('문구') ||
    m.includes('모닝글로리') ||
    m.includes('오피스') ||
    m.includes('다이소')
  ) {
    return '사무용품비';
  }

  // Books / Printing
  if (
    m.includes('교보') ||
    m.includes('yes24') ||
    m.includes('알라딘') ||
    m.includes('서점') ||
    m.includes('킨코스') ||
    m.includes('인쇄') ||
    m.includes('출력')
  ) {
    return '도서인쇄비';
  }

  // Meetings / Entertainment
  if (m.includes('미팅') || m.includes('접대') || m.includes('골프') || m.includes('호텔')) {
    return '접대비/회의비';
  }

  // Telecommunications
  if (
    m.includes('skt') ||
    m.includes('kt') ||
    m.includes('lgu') ||
    m.includes('통신') ||
    m.includes('인터넷')
  ) {
    return '통신비';
  }

  return '식대/복리후생비'; // most frequent default
}

/**
 * Parses raw SMS / notification text or user memo into structured Expense Item.
 */
export function parseReceiptText(text: string): ParsedReceiptResult {
  const clean = text.trim();
  const currentYear = new Date().getFullYear();

  // 1. Amount extraction: look for numbers followed by 원 or amount formats like 15,000원 or 15000
  let totalAmount = 0;
  const amountMatch = clean.match(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,8})\s*원?/);
  if (amountMatch) {
    totalAmount = Number(amountMatch[1].replace(/,/g, ''));
  }

  // 2. Date extraction: YYYY-MM-DD or MM/DD or MM.DD or M월 D일
  let date = new Date().toISOString().slice(0, 10);
  const fullDateMatch = clean.match(/(202[0-9])[-/.]([0-1]?[0-9])[-/.]([0-3]?[0-9])/);
  const shortDateMatch = clean.match(/([0-1]?[0-9])[-/.]([0-3]?[0-9])/);
  const koreanDateMatch = clean.match(/([0-1]?[0-9])월\s*([0-3]?[0-9])일/);

  if (fullDateMatch) {
    const y = fullDateMatch[1];
    const m = fullDateMatch[2].padStart(2, '0');
    const d = fullDateMatch[3].padStart(2, '0');
    date = `${y}-${m}-${d}`;
  } else if (shortDateMatch) {
    const m = shortDateMatch[1].padStart(2, '0');
    const d = shortDateMatch[2].padStart(2, '0');
    date = `${currentYear}-${m}-${d}`;
  } else if (koreanDateMatch) {
    const m = koreanDateMatch[1].padStart(2, '0');
    const d = koreanDateMatch[2].padStart(2, '0');
    date = `${currentYear}-${m}-${d}`;
  }

  // 3. Payment Method detection
  let paymentMethod: PaymentMethod = '법인카드';
  if (clean.includes('개인') || clean.includes('사후') || clean.includes('체크')) {
    paymentMethod = '개인카드(사후정산)';
  } else if (clean.includes('법인')) {
    paymentMethod = '법인카드';
  } else if (clean.includes('현금영수증')) {
    paymentMethod = '현금영수증';
  } else if (clean.includes('세금계산서')) {
    paymentMethod = '전자세금계산서';
  } else if (clean.includes('이체') || clean.includes('송금')) {
    paymentMethod = '계좌이체';
  }

  // 4. Merchant extraction
  let merchant = '';
  // Try extracting merchant from common patterns:
  // e.g. [신한카드] 09/25 12:43 14,000원 삼진식당
  // e.g. 스타벅스 12,000원
  // Remove known tokens: date, time, amount, brackets, card names
  let stripped = clean
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/\([^\)]+\)/g, ' ')
    .replace(/202[0-9][-/.][0-9]{1,2}[-/.][0-9]{1,2}/g, ' ')
    .replace(/[0-9]{1,2}[-/.][0-9]{1,2}/g, ' ')
    .replace(/[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?/g, ' ')
    .replace(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,8})\s*원?/g, ' ')
    .replace(/승인|일시불|누적|잔여|한도|체크|신용|결제|완료|취소|원/g, ' ')
    .trim();

  const words = stripped.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    merchant = words[0];
  } else {
    merchant = '사용처 미정';
  }

  // 5. Inferred category
  const category = inferCategory(merchant);

  // 6. Inferred purpose
  let purpose = '';
  if (words.length > 1) {
    purpose = words.slice(1).join(' ');
  } else {
    purpose = `${category} 업무 지출`;
  }

  return {
    date,
    merchant,
    totalAmount,
    category,
    paymentMethod,
    receiptType: paymentMethod === '현금영수증' ? '현금영수증' : '신용카드매출전표',
    purpose,
  };
}
