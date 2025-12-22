import { useCallback, useMemo, useRef, useState } from 'react'
import { clamp } from '../lib/hash'

export type PanZoom = {
  x: number
  y: number
  scale: number
}

type Pointer = { id: number; x: number; y: number }

function dist(a: Pointer, b: Pointer) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

function midpoint(a: Pointer, b: Pointer) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export function usePanZoom() {
  const [state, setState] = useState<PanZoom>({ x: 0, y: 0, scale: 1 })
  const pointersRef = useRef<Map<number, Pointer>>(new Map())
  const gestureRef = useRef<
    | null
    | {
        start: PanZoom
        startDist?: number
        startMid?: { x: number; y: number }
      }
  >(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    pointersRef.current.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY })
    gestureRef.current = { start: state }
  }, [state])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const prev = pointersRef.current.get(e.pointerId)
    if (!prev) return
    const next = { id: e.pointerId, x: e.clientX, y: e.clientY }
    pointersRef.current.set(e.pointerId, next)
    const pts = [...pointersRef.current.values()]
    const g = gestureRef.current ?? { start: state }

    if (pts.length === 1) {
      // drag: use movement in screen space (touch-safe)
      const dx = next.x - prev.x
      const dy = next.y - prev.y
      setState((s) => ({ ...s, x: s.x + dx, y: s.y + dy }))
      gestureRef.current = { start: g.start }
      return
    }

    if (pts.length >= 2) {
      const a = pts[0]!
      const b = pts[1]!
      const d = dist(a, b)
      const mid = midpoint(a, b)

      if (!g.startDist || !g.startMid) {
        gestureRef.current = { start: state, startDist: d, startMid: mid }
        return
      }

      const nextScale = clamp(g.start.scale * (d / g.startDist), 0.55, 2.6)

      // keep midpoint stable: adjust translation by midpoint delta
      const mdx = mid.x - g.startMid.x
      const mdy = mid.y - g.startMid.y
      setState({
        x: g.start.x + mdx,
        y: g.start.y + mdy,
        scale: nextScale,
      })
    }
  }, [state])

  const onPointerUpOrCancel = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId)
    if (pointersRef.current.size === 0) gestureRef.current = null
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    // Desktop-friendly zoom (trackpad/mouse). Not critical for mobile but harmless.
    e.preventDefault()
    const delta = -e.deltaY
    const factor = delta > 0 ? 1.06 : 0.94
    setState((s) => ({ ...s, scale: clamp(s.scale * factor, 0.55, 2.6) }))
  }, [])

  const handlers = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerUpOrCancel,
      onPointerCancel: onPointerUpOrCancel,
      onWheel,
    }),
    [onPointerDown, onPointerMove, onPointerUpOrCancel, onWheel],
  )

  return { panZoom: state, setPanZoom: setState, handlers }
}


