import { useEffect, useMemo, useRef } from 'react'
import { hashStringToUint32, mulberry32 } from '../lib/hash'
import type { PanZoom } from '../hooks/usePanZoom'

type Star = {
  x: number
  y: number
  r: number
  a: number
  tw: number
}

export function StarfieldCanvas({ seedKey, panZoom }: { seedKey: string; panZoom: PanZoom }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const panRef = useRef(panZoom)
  useEffect(() => {
    panRef.current = panZoom
  }, [panZoom])
  const stars = useMemo<Star[]>(() => {
    const seed = hashStringToUint32(seedKey)
    const rnd = mulberry32(seed)
    const arr: Star[] = []
    for (let i = 0; i < 260; i++) {
      arr.push({
        x: rnd(),
        y: rnd(),
        r: 0.35 + rnd() * 1.35,
        a: 0.25 + rnd() * 0.7,
        tw: rnd() * 2 * Math.PI,
      })
    }
    return arr
  }, [seedKey])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)

      // subtle nebula haze
      const g1 = ctx.createRadialGradient(w * 0.25, h * 0.18, 0, w * 0.25, h * 0.18, Math.max(w, h) * 0.65)
      g1.addColorStop(0, 'rgba(180,120,255,0.08)')
      g1.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, w, h)

      const g2 = ctx.createRadialGradient(w * 0.86, h * 0.44, 0, w * 0.86, h * 0.44, Math.max(w, h) * 0.55)
      g2.addColorStop(0, 'rgba(90,180,255,0.06)')
      g2.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, w, h)

      // parallax offset based on pan/scale (small effect)
      const px = panRef.current.x * 0.06
      const py = panRef.current.y * 0.06

      for (const s of stars) {
        const tw = 0.55 + 0.45 * Math.sin(t * 0.0012 + s.tw)
        const a = s.a * tw
        const x = (s.x * w + px + w) % w
        const y = (s.y * h + py + h) % h

        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(4)})`
        ctx.arc(x, y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [stars])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
    />
  )
}


