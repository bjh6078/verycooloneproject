export type ExpenseCategory =
  | '식대/복리후생비'
  | '교통비/유류비'
  | '사무용품비'
  | '소모품비'
  | '접대비/회의비'
  | '도서인쇄비'
  | '통신비'
  | '교육훈련비'
  | '여비교통비'
  | '지급수수료'
  | '기타';

export type PaymentMethod =
  | '개인카드(사후정산)'
  | '법인카드'
  | '현금영수증'
  | '전자세금계산서'
  | '계좌이체';

export type ReceiptType =
  | '신용카드매출전표'
  | '현금영수증'
  | '전자세금계산서'
  | '간이영수증'
  | '전자영수증캡처';

export interface ExpenseItem {
  id: string;
  receiptNumber: number; // No. 1, 2, 3...
  date: string; // YYYY-MM-DD
  merchant: string; // 상호명
  category: ExpenseCategory; // 계정과목
  paymentMethod: PaymentMethod; // 결제수단
  totalAmount: number; // 지출총액
  hasVat: boolean; // 부가세 포함 여부
  supplyAmount: number; // 공급가액
  vatAmount: number; // 부가세
  receiptType: ReceiptType; // 증빙구분
  purpose: string; // 사용목적 및 참석자 / 비고
  projectCode?: string; // 프로젝트 또는 고객사
  receiptImage?: string; // Data URL or Image name
}

export interface ExpenseReportHeader {
  title: string;
  reportMonth: string; // YYYY-MM
  applicantName: string;
  department: string;
  position: string;
  bankName: string;
  accountNumber: string;
  includeApprovalBox: boolean;
  notes: string;
}

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  '식대/복리후생비',
  '교통비/유류비',
  '사무용품비',
  '소모품비',
  '접대비/회의비',
  '도서인쇄비',
  '통신비',
  '교육훈련비',
  '여비교통비',
  '지급수수료',
  '기타',
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  '개인카드(사후정산)',
  '법인카드',
  '현금영수증',
  '전자세금계산서',
  '계좌이체',
];

export const DEFAULT_RECEIPT_TYPES: ReceiptType[] = [
  '신용카드매출전표',
  '현금영수증',
  '전자세금계산서',
  '간이영수증',
  '전자영수증캡처',
];
