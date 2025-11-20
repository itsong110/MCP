'use server'

import { createServerClient } from '@/lib/supabase/server'
import { Memo, MemoFormData } from '@/types/memo'
import { revalidatePath } from 'next/cache'

// DB 스키마 타입 정의
interface DbMemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[] | null
  summary: string | null
  created_at: string
  updated_at: string
}

// DB 스키마를 Memo 인터페이스로 변환
function dbToMemo(row: DbMemoRow): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags || [],
    summary: row.summary || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// DB 스키마 데이터 타입 정의
interface DbMemoData {
  title: string
  content: string
  category: string
  tags: string[]
  summary: string | null
}

// Memo 인터페이스를 DB 스키마로 변환
function memoToDb(memo: Partial<Memo>): DbMemoData {
  return {
    title: memo.title!,
    content: memo.content!,
    category: memo.category!,
    tags: memo.tags || [],
    summary: memo.summary || null,
  }
}

// 모든 메모 가져오기
export async function getMemos(): Promise<Memo[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching memos:', error)
      throw error
    }

    return (data || []).map(dbToMemo)
  } catch (error) {
    console.error('Failed to get memos:', error)
    return []
  }
}

// 특정 메모 가져오기
export async function getMemoById(id: string): Promise<Memo | null> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching memo:', error)
      return null
    }

    return data ? dbToMemo(data) : null
  } catch (error) {
    console.error('Failed to get memo:', error)
    return null
  }
}

// 메모 생성
export async function createMemo(formData: MemoFormData): Promise<Memo> {
  try {
    const supabase = createServerClient()
    const dbData = {
      ...memoToDb(formData),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('memos')
      .insert(dbData)
      .select()
      .single()

    if (error) {
      console.error('Error creating memo:', error)
      throw error
    }

    revalidatePath('/')
    return dbToMemo(data)
  } catch (error) {
    console.error('Failed to create memo:', error)
    throw error
  }
}

// 메모 업데이트
export async function updateMemo(id: string, formData: MemoFormData): Promise<Memo> {
  try {
    const supabase = createServerClient()
    const dbData = {
      ...memoToDb(formData),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('memos')
      .update(dbData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating memo:', error)
      throw error
    }

    revalidatePath('/')
    return dbToMemo(data)
  } catch (error) {
    console.error('Failed to update memo:', error)
    throw error
  }
}

// 메모 삭제
export async function deleteMemo(id: string): Promise<void> {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('memos').delete().eq('id', id)

    if (error) {
      console.error('Error deleting memo:', error)
      throw error
    }

    revalidatePath('/')
  } catch (error) {
    console.error('Failed to delete memo:', error)
    throw error
  }
}

// 메모 요약 업데이트
export async function updateMemoSummary(id: string, summary: string): Promise<Memo> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('memos')
      .update({
        summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating memo summary:', error)
      throw error
    }

    revalidatePath('/')
    return dbToMemo(data)
  } catch (error) {
    console.error('Failed to update memo summary:', error)
    throw error
  }
}

