'use client'

import { useState, useCallback, useMemo, useTransition, useOptimistic } from 'react'
import { useRouter } from 'next/navigation'
import { Memo, MemoFormData } from '@/types/memo'
import {
  createMemo as createMemoAction,
  updateMemo as updateMemoAction,
  deleteMemo as deleteMemoAction,
} from '@/app/actions/memoActions'

interface UseMemosProps {
  initialMemos: Memo[]
}

export const useMemos = ({ initialMemos }: UseMemosProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [memos, setMemos] = useState<Memo[]>(initialMemos)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Optimistic updates
  const [optimisticMemos, setOptimisticMemos] = useOptimistic(
    memos,
    (state, action: { type: string; memo?: Memo; id?: string }) => {
      switch (action.type) {
        case 'create':
          return action.memo ? [action.memo, ...state] : state
        case 'update':
          return action.memo
            ? state.map(m => (m.id === action.memo!.id ? action.memo! : m))
            : state
        case 'delete':
          return action.id ? state.filter(m => m.id !== action.id) : state
        default:
          return state
      }
    }
  )

  // 메모 목록 동기화 (서버에서 최신 데이터 가져오기)
  const refreshMemos = useCallback(() => {
    startTransition(() => {
      router.refresh()
    })
  }, [router])

  // 메모 생성
  const createMemo = useCallback(
    async (formData: MemoFormData) => {
      const tempMemo: Memo = {
        id: 'temp-' + Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Optimistic update (startTransition으로 감싸기)
      startTransition(() => {
        setOptimisticMemos({ type: 'create', memo: tempMemo })
      })

      try {
        const newMemo = await createMemoAction(formData)
        setMemos(prev => [newMemo, ...prev])
        refreshMemos()
        return newMemo
      } catch (error) {
        console.error('Failed to create memo:', error)
        // Rollback on error
        refreshMemos()
        throw error
      }
    },
    [setOptimisticMemos, refreshMemos, startTransition]
  )

  // 메모 업데이트
  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData) => {
      const existingMemo = memos.find(memo => memo.id === id)
      if (!existingMemo) return

      const optimisticMemo: Memo = {
        ...existingMemo,
        ...formData,
        updatedAt: new Date().toISOString(),
      }

      // Optimistic update (startTransition으로 감싸기)
      startTransition(() => {
        setOptimisticMemos({ type: 'update', memo: optimisticMemo })
      })

      try {
        const updatedMemo = await updateMemoAction(id, formData)
        setMemos(prev => prev.map(memo => (memo.id === id ? updatedMemo : memo)))
        refreshMemos()
      } catch (error) {
        console.error('Failed to update memo:', error)
        // Rollback on error
        refreshMemos()
        throw error
      }
    },
    [memos, setOptimisticMemos, refreshMemos, startTransition]
  )

  // 메모 삭제
  const deleteMemo = useCallback(
    async (id: string) => {
      // Optimistic update (startTransition으로 감싸기)
      startTransition(() => {
        setOptimisticMemos({ type: 'delete', id })
      })

      try {
        await deleteMemoAction(id)
        setMemos(prev => prev.filter(memo => memo.id !== id))
        refreshMemos()
      } catch (error) {
        console.error('Failed to delete memo:', error)
        // Rollback on error
        refreshMemos()
        throw error
      }
    },
    [setOptimisticMemos, refreshMemos, startTransition]
  )

  // 메모 검색
  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  // 카테고리 필터링
  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  // 특정 메모 가져오기
  const getMemoById = useCallback(
    (id: string): Memo | undefined => {
      return memos.find(memo => memo.id === id)
    },
    [memos]
  )

  // 필터링된 메모 목록
  const filteredMemos = useMemo(() => {
    let filtered = optimisticMemos

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [optimisticMemos, selectedCategory, searchQuery])

  // 통계 정보
  const stats = useMemo(() => {
    const totalMemos = memos.length
    const categoryCounts = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    // 상태
    memos: filteredMemos,
    allMemos: memos,
    loading: isPending,
    searchQuery,
    selectedCategory,
    stats,

    // 메모 CRUD
    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,

    // 필터링 & 검색
    searchMemos,
    filterByCategory,

    // 유틸리티
    refreshMemos,
  }
}
