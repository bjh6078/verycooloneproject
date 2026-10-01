# 스마트 지출결의서 & 경비 영수증 정산기 (Smart Expense Report)

영수증 입력, 부가세 자동 분리, 결재란이 포함된 회사·세무사 제출용 표준 지출결의서 웹 애플리케이션입니다.

## 🚀 주요 기능

- **지출 내역 관리**: 일자, 항목, 금액(공급가액/부가세 자동 계산), 결제수단, 증빙구분 관리
- **스마트 문자/영수증 파싱**: 카드 결제 SMS 문자를 붙여넣으면 가맹점, 금액, 결제수단, 카테고리를 자동 분석하여 등록
- **보고서 인쇄/PDF 저장**: 회사 결재란(기안/검토/승인)이 포함된 표준 A4 지출결의서 양식 미리보기 및 출력
- **엑셀/CSV 내보내기**: 회사 및 세무사 제출용 `.xlsx` 및 `.csv` 다운로드 지원
- **클립보드 복사**: 엑셀에 바로 붙여넣을 수 있는 TSV 포맷 클립보드 복사
- **로컬 저장(LocalStorage)**: 작성 중인 내역과 기본 정보가 브라우저에 안전하게 자동 저장

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React (Icons), Motion
- **Build Tool**: Vite
- **Excel Processing**: SheetJS (xlsx)

## 💻 로컬 실행 방법

1. **패키지 설치**:
   ```bash
   npm install
   ```

2. **개발 서버 실행**:
   ```bash
   npm run dev
   ```

3. **프로덕션 빌드 및 검증**:
   ```bash
   npm run build
   ```

## ☁️ Vercel 배포 가이드

1. **GitHub에 프로젝트 푸시**:
   ```bash
   git init
   git add .
   git commit -m "feat: Initial commit for Smart Expense Report"
   git branch -M main
   git remote add origin <사용자_깃허브_리포지토리_URL>
   git push -u origin main
   ```

2. **Vercel 연동**:
   - [Vercel Dashboard](https://vercel.com/) 접속 후 **Add New...** > **Project** 선택
   - 해당 GitHub 리포지토리 선택
   - Framework Preset: `Vite` (자동 감지됨)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - 별도의 환경 변수(Environment Variables) 설정 없이 바로 **Deploy** 버튼 클릭
