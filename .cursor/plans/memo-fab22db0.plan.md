<!-- fab22db0-e312-430d-821f-5c777ba12443 d0f86762-910c-4104-b788-1b3b56c6faf4 -->
# 마크다운 에디터/뷰어 도입 계획

1. Context7 가이드 & 의존성 준비

- Context7 MCP 서버에서 제공하는 React MDEditor 사용 가이드를 참고해 구성 옵션(미리보기 모드, CSS 요구 사항 등)을 확인합니다.
- `@uiw/react-md-editor`, `@uiw/react-markdown-preview`, `rehype-sanitize`(XSS 방지) 등을 `package.json`에 추가하고, `src/app/globals.css`에 필요한 CSS(`markdown-editor.css`, `markdown.css`)를 병합합니다.

2. 재사용 가능한 MarkdownEditor 컴포넌트 추가 (`src/components/MarkdownEditor.tsx`)

- Next.js의 SSR 이슈를 피하려고 `dynamic` import로 `MDEditor`를 불러오고, `preview="live"`, 기본 높이, placeholder, 다크/라이트 대응 props를 설정합니다.
- `value`, `onChange`, `error` 메시지 등을 prop으로 받아 `MemoForm`에서 바로 쓸 수 있게 추상화합니다.

3. 메모 작성 폼 교체 (`src/components/MemoForm.tsx`)

- 기존 textarea 영역을 MarkdownEditor로 대체하고, 제출 시 콘텐츠 공백 검사와 태그 등의 기존 로직을 유지합니다.
- 메모 생성/수정 시 실시간 프리뷰가 항상 보이도록 기본 프리뷰 모드를 `live`로 두고, 반응형 레이아웃을 조정합니다.

4. 마크다운 뷰어 적용 (`src/components/MemoViewerModal.tsx`, 필요시 `src/components/MemoItem.tsx`)

- `MemoViewerModal` 본문을 `MDEditor.Markdown`(또는 `@uiw/react-markdown-preview`)으로 렌더링해 정확한 서식을 보여주고, 배경/텍스트 색상과 스크롤 처리를 다듬습니다.
- 카드 요약부(`MemoItem`)에도 간단한 마크다운 미리보기를 추가하거나 최소한 기본 스타일을 유지하도록 fallback을 제공해 일관된 뷰어 경험을 제공합니다.

5. 검증

- 새 메모 작성/수정/삭제 플로우, 실시간 프리뷰, 모달 뷰어가 모두 정상 작동하는지 브라우저에서 확인하고, Context7 지침과의 차이가 없는지 재검토합니다.

### To-dos

- [ ] 메모 상세 모달 컴포넌트 추가
- [ ] 페이지에 뷰어 상태/핸들러 연결
- [ ] 메모카드 클릭 시 뷰어 열기