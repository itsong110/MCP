'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'

// SSR을 피하기 위해 동적 import 사용
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
      <span className="text-gray-500">에디터를 불러오는 중...</span>
    </div>
  ),
})

interface MarkdownEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  height?: number
  error?: string
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '마크다운으로 메모를 작성하세요...',
  height = 400,
  error,
}: MarkdownEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[400px] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
        <span className="text-gray-500">에디터를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <MDEditor
        value={value}
        onChange={onChange}
        preview="live"
        height={height}
        data-color-mode="light"
        textareaProps={{
          placeholder,
        }}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

