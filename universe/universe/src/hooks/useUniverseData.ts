import { useEffect, useMemo, useState } from 'react'
import type { UniverseData } from '../lib/types'
import { toISODateString } from '../lib/date'

type State =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: UniverseData }

function isUniverseData(x: unknown): x is UniverseData {
  if (!x || typeof x !== 'object') return false
  const obj = x as Record<string, unknown>
  if (typeof obj.anniversary_date !== 'string') return false
  if (!Array.isArray(obj.memories)) return false
  return true
}

export function useUniverseData() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data.json`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`读取 data.json 失败：HTTP ${res.status}`)
        const json = (await res.json()) as unknown
        if (!isUniverseData(json)) throw new Error('data.json 结构不符合约定')
        if (!cancelled) setState({ status: 'ready', data: json })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (!cancelled) setState({ status: 'error', error: msg })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const sorted = useMemo(() => {
    if (state.status !== 'ready') return null
    // 只展示到“今天”(含今天)。这样可以在 data.json 里提前准备未来内容，但页面不会提前露出。
    const today = toISODateString(new Date())
    const memories = state.data.memories
      .filter((m) => m.date.localeCompare(today) <= 0)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
    return { ...state.data, memories }
  }, [state])

  return { state, data: sorted }
}


