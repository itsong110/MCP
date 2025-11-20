import { getMemos } from '@/app/actions/memoActions'
import MemoAppClient from '@/components/MemoAppClient'

export default async function Home() {
  const initialMemos = await getMemos()

  return <MemoAppClient initialMemos={initialMemos} />
}
