import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getMemoById, updateMemoSummary } from '@/app/actions/memoActions'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { content, memoId } = await request.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!memoId || typeof memoId !== 'string') {
      return NextResponse.json(
        { error: 'Memo ID is required' },
        { status: 400 }
      )
    }

    // 기존 메모 조회하여 요약이 이미 있는지 확인
    const existingMemo = await getMemoById(memoId)

    if (!existingMemo) {
      return NextResponse.json(
        { error: 'Memo not found' },
        { status: 404 }
      )
    }

    // 요약이 이미 존재하면 재사용
    if (existingMemo.summary && existingMemo.summary.trim()) {
      return NextResponse.json({
        summary: existingMemo.summary,
        memo: existingMemo,
        cached: true,
      })
    }

    // 요약이 없을 때만 LLM 호출
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    // 메모 요약을 위한 프롬프트 구성 (한 문장 요약)
    const prompt = `다음 메모를 한 문장으로 간결하게 요약해주세요. 핵심 내용만 포함하여 50자 이내로 작성해주세요.

메모 내용:
${content}

요약:`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0.7,
      },
    })

    const summary = response.text.trim()

    // DB에 요약 저장
    const updatedMemo = await updateMemoSummary(memoId, summary)

    return NextResponse.json({ summary, memo: updatedMemo, cached: false })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

