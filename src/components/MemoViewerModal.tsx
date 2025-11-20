'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import '@uiw/react-markdown-preview/markdown.css'

// SSR을 피하기 위해 동적 import 사용
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
  ssr: false,
})

interface MemoViewerModalProps {
  memo: Memo | null
  isOpen: boolean
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
  onMemoUpdated?: (memo: Memo) => void
}

export default function MemoViewerModal({
  memo,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onMemoUpdated,
}: MemoViewerModalProps) {
  const [mounted, setMounted] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const summaryCacheRef = useRef<Record<string, string>>({})
  const currentMemoIdRef = useRef<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 메모가 열릴 때 자동으로 요약 생성
  useEffect(() => {
    if (!isOpen || !memo) {
      // 모달이 닫히면 상태 초기화
      if (!isOpen) {
        setSummary(null)
        setSummaryLoading(false)
        setSummaryError(null)
      }
      return
    }

    // 같은 메모를 다시 열면 요약을 다시 생성하지 않음
    if (currentMemoIdRef.current === memo.id) {
      return
    }

    currentMemoIdRef.current = memo.id

    // 저장된 요약이 있으면 표시 (클라이언트에 이미 있는 경우)
    if (memo.summary && memo.summary.trim()) {
      setSummary(memo.summary)
      setSummaryLoading(false)
      setSummaryError(null)
      return
    }

    // 요약이 없으면 API 호출 (DB에 저장된 요약이 있는지 확인하거나 새로 생성)
    const fetchSummary = async () => {
      setSummaryLoading(true)
      setSummaryError(null)
      setSummary(null)

      try {
        const response = await fetch('/api/memos/summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: memo.content,
            memoId: memo.id,
          }),
        })

        if (!response.ok) {
          throw new Error('요약 생성에 실패했습니다.')
        }

        const data = await response.json()
        const summaryText = data.summary?.trim() || ''
        const updatedMemo = data.memo

        // 부모 컴포넌트에 업데이트 알림 (캐시된 요약이든 새로 생성된 요약이든)
        if (onMemoUpdated && updatedMemo) {
          onMemoUpdated(updatedMemo)
        }

        setSummary(summaryText)
      } catch (error) {
        console.error('Error fetching summary:', error)
        setSummaryError('요약을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setSummaryLoading(false)
      }
    }

    fetchSummary()
  }, [isOpen, memo])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !memo) return null

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackgroundClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* 헤더 */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                  memo.category}
              </span>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 whitespace-pre-wrap break-words">
              {memo.title}
            </h2>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium text-gray-700">생성:</span>{' '}
                {formatDateTime(memo.createdAt)}
              </div>
              <div>
                <span className="font-medium text-gray-700">수정:</span>{' '}
                {formatDateTime(memo.updatedAt)}
              </div>
            </div>
          </div>

          {/* 요약 섹션 */}
          {(summaryLoading || summary || summaryError) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">요약</h3>
              </div>
              {summaryLoading && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">요약을 생성하는 중...</span>
                </div>
              )}
              {summaryError && (
                <p className="text-sm text-red-600">{summaryError}</p>
              )}
              {summary && !summaryLoading && (
                <div className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                  {summary}
                </div>
              )}
            </div>
          )}

          {/* 내용 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            {mounted ? (
              <MarkdownPreview
                source={memo.content}
                style={{
                  backgroundColor: 'transparent',
                  color: '#1f2937',
                }}
                data-color-mode="light"
              />
            ) : (
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {memo.content}
              </p>
            )}
          </div>

          {/* 태그 */}
          {memo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {memo.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 액션 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onEdit(memo)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              편집
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
            <button
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

