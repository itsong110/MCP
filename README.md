# 📝 메모 앱 (Memo App)

**핸즈온 실습용 Next.js 메모 애플리케이션**

Supabase 데이터베이스 기반의 완전한 CRUD 기능을 갖춘 메모 앱으로, MCP 연동 및 GitHub PR 생성 실습의 기반이 되는 프로젝트입니다.

## 🚀 주요 기능

- ✅ 메모 생성, 읽기, 수정, 삭제 (CRUD)
- 📂 카테고리별 메모 분류 (개인, 업무, 학습, 아이디어, 기타)
- 🏷️ 태그 시스템으로 메모 태깅
- 🔍 제목, 내용, 태그 기반 실시간 검색
- 📱 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 💾 Supabase 데이터베이스 기반 데이터 저장
- 🤖 AI 기반 메모 요약 기능 (Google Gemini)
- 🎨 모던한 UI/UX with Tailwind CSS

## 🛠 기술 스택

- **Framework**: Next.js 15.4.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks (useState, useEffect, useMemo, useTransition, useOptimistic)
- **Server Actions**: Next.js Server Actions
- **AI**: Google Gemini API
- **Package Manager**: npm

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Supabase 프로젝트 설정:**
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정 > API에서 URL과 Anon Key 복사
3. Supabase CLI로 프로젝트 연결: `supabase link`

### 3. 데이터베이스 마이그레이션

Supabase MCP를 통해 마이그레이션이 자동으로 적용됩니다. 수동으로 적용하려면:

```bash
# Supabase CLI 사용 시
supabase db push
```

또는 Supabase Dashboard에서 SQL Editor를 사용하여 마이그레이션을 실행할 수 있습니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 브라우저 접속

```
http://localhost:3000
```

## 📁 프로젝트 구조

```
memo-app/
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── memoActions.ts   # 서버 액션 (CRUD)
│   │   ├── api/
│   │   │   └── memos/
│   │   │       └── summary/
│   │   │           └── route.ts  # 요약 API 라우트
│   │   ├── globals.css          # 글로벌 스타일
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   └── page.tsx             # 메인 페이지 (서버 컴포넌트)
│   ├── components/
│   │   ├── MemoAppClient.tsx    # 클라이언트 앱 컴포넌트
│   │   ├── MemoForm.tsx         # 메모 생성/편집 폼
│   │   ├── MemoItem.tsx         # 개별 메모 카드
│   │   ├── MemoList.tsx         # 메모 목록 및 필터
│   │   └── MemoViewerModal.tsx  # 메모 상세 뷰어
│   ├── hooks/
│   │   └── useMemos.ts          # 메모 관리 커스텀 훅
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts        # 클라이언트 Supabase 클라이언트
│   │       └── server.ts         # 서버 Supabase 클라이언트
│   ├── types/
│   │   └── memo.ts              # 메모 타입 정의
│   └── utils/
│       ├── localStorage.ts      # LocalStorage 유틸리티 (레거시)
│       └── seedData.ts          # 샘플 데이터 시딩
└── README.md                    # 프로젝트 문서
```

## 💡 주요 컴포넌트

### MemoItem

- 개별 메모를 카드 형태로 표시
- 편집/삭제 액션 버튼
- 카테고리 배지 및 태그 표시
- 날짜 포맷팅 및 텍스트 클램핑

### MemoForm

- 메모 생성/편집을 위한 모달 폼
- 제목, 내용, 카테고리, 태그 입력
- 태그 추가/제거 기능
- 폼 검증 및 에러 처리

### MemoList

- 메모 목록 그리드 표시
- 실시간 검색 및 카테고리 필터링
- 통계 정보 및 빈 상태 처리
- 반응형 그리드 레이아웃

## 📊 데이터 구조

### TypeScript 인터페이스

```typescript
interface Memo {
  id: string // 고유 식별자 (UUID)
  title: string // 메모 제목
  content: string // 메모 내용
  category: string // 카테고리 (personal, work, study, idea, other)
  tags: string[] // 태그 배열
  summary?: string // AI 생성 요약 (선택적)
  createdAt: string // 생성 날짜 (ISO string)
  updatedAt: string // 수정 날짜 (ISO string)
}
```

### 데이터베이스 스키마

```sql
CREATE TABLE memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('personal', 'work', 'study', 'idea', 'other')),
  tags TEXT[] DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**인덱스:**
- `idx_memos_category`: 카테고리 필터링
- `idx_memos_created_at`: 생성일 정렬

## 🎯 마이그레이션 완료

이 프로젝트는 LocalStorage에서 Supabase 데이터베이스로 성공적으로 마이그레이션되었습니다:

### 완료된 작업

- ✅ Supabase 데이터베이스 스키마 생성
- ✅ 서버 액션 기반 CRUD 구현
- ✅ Next.js 서버 컴포넌트 통합
- ✅ Optimistic Updates 구현
- ✅ AI 요약 기능 DB 연동
- ✅ 목업 데이터 생성

### 주요 변경사항

1. **데이터 저장소**: LocalStorage → Supabase PostgreSQL
2. **데이터 페칭**: 클라이언트 사이드 → 서버 사이드 (Server Actions)
3. **상태 관리**: useState → useTransition + useOptimistic
4. **요약 저장**: 메모리 → 데이터베이스 영구 저장

## 🎯 추가 실습 시나리오

### 실습 1: 기능 확장 + GitHub PR (60분)

- 메모 즐겨찾기 기능 추가
- Cursor Custom Modes로 PR 생성
- 코드 리뷰 및 협업 실습

### 실습 2: Playwright MCP 테스트 (45분)

- E2E 테스트 작성
- 브라우저 자동화 및 시각적 테스트
- 성능 측정 및 리포트

자세한 실습 가이드는 강의자료를 참고하세요.

## 🎨 샘플 데이터

앱 첫 실행 시 6개의 샘플 메모가 자동으로 생성됩니다:

- 프로젝트 회의 준비 (업무)
- React 18 새로운 기능 학습 (학습)
- 새로운 앱 아이디어: 습관 트래커 (아이디어)
- 주말 여행 계획 (개인)
- 독서 목록 (개인)
- 성능 최적화 아이디어 (아이디어)

## 🔧 개발 가이드

### 서버 액션 사용

```typescript
import {
  getMemos,
  getMemoById,
  createMemo,
  updateMemo,
  deleteMemo,
  updateMemoSummary,
} from '@/app/actions/memoActions'

// 서버 컴포넌트에서
const memos = await getMemos()

// 서버 액션에서
const newMemo = await createMemo({
  title: '새 메모',
  content: '내용',
  category: 'personal',
  tags: ['태그1'],
})
```

### 클라이언트 훅 사용

```typescript
// useMemos 훅 사용 예시
const {
  memos, // 필터링된 메모 목록
  loading, // 로딩 상태
  createMemo, // 메모 생성 (서버 액션 호출)
  updateMemo, // 메모 수정 (서버 액션 호출)
  deleteMemo, // 메모 삭제 (서버 액션 호출)
  searchMemos, // 검색
  filterByCategory, // 카테고리 필터링
  stats, // 통계 정보
} = useMemos({ initialMemos })
```

### 요약 기능 사용

메모 상세 뷰어에서 자동으로 요약이 생성되며, 생성된 요약은 데이터베이스에 저장됩니다.

```typescript
// API 라우트에서 요약 생성 및 저장
POST /api/memos/summary
{
  "content": "메모 내용",
  "memoId": "메모 ID"
}
```

## 🚀 배포

### Vercel 배포

```bash
npm run build
npx vercel --prod
```

### Netlify 배포

```bash
npm run build
# dist 폴더를 Netlify에 드래그 앤 드롭
```

## 📄 라이선스

MIT License - 학습 및 실습 목적으로 자유롭게 사용 가능합니다.

## 🤝 기여

이 프로젝트는 교육용으로 제작되었습니다. 개선사항이나 버그 리포트는 이슈나 PR로 제출해 주세요.

---

**Made with ❤️ for hands-on workshop**
