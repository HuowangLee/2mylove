import { memo, useMemo, type CSSProperties } from 'react'
import type { Memory } from '../lib/types'
import { clamp, hashStringToUint32 } from '../lib/hash'
import { hashToHue } from '../lib/color'

export type PlanetProps = {
  memory: Memory
  dayNumber?: number
  showDayNumber?: boolean
  onClick?: (m: Memory) => void
}

function importanceToSize(importance?: number) {
  const v = Math.max(1, Math.min(10, importance ?? 5))
  // 1..10 -> 44..116
  return 44 + (v - 1) * 8
}

export const Planet = memo(function Planet({
  memory,
  dayNumber,
  showDayNumber,
  onClick,
}: PlanetProps) {
  const size = importanceToSize(memory.importance)

  const seed = useMemo(() => hashStringToUint32(memory.id), [memory.id])
  const hue = useMemo(() => {
    // Make colors distinct: base hue derived from id (stable & well-distributed),
    // mood_score only nudges it a bit so high scores don't collapse into similar colors.
    const base = hashToHue(memory.id)
    if (typeof memory.mood_score !== 'number') return base
    const ms = clamp(memory.mood_score, 0, 100)
    const shift = (ms - 50) * 1.2 // -60..+60
    return (base + shift + 360) % 360
  }, [memory.id, memory.mood_score])

  const filterId = `turb-${memory.id.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const cloudFilterId = `cloud-${memory.id.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const baseFrequency = useMemo(() => {
    // keep it subtle
    const r = (seed % 1000) / 1000
    return 0.012 + r * 0.02
  }, [seed])
  const cloudFrequency = useMemo(() => {
    const r = ((seed >>> 10) % 1000) / 1000
    return 0.006 + r * 0.012
  }, [seed])
  const floatDelay = useMemo(() => `${((seed % 8000) / 1000).toFixed(2)}s`, [seed])

  return (
    <button
      type="button"
      onClick={() => onClick?.(memory)}
      className={[
        'planet-wrap planet-float',
        memory.has_ring ? 'has-ring' : '',
        'outline-none',
        'active:scale-[0.98]',
        'transition-transform duration-200',
      ].join(' ')}
      style={
        {
          ['--planet-size' as never]: `${size}px`,
          ['--planet-h' as never]: `${hue}`,
          ['--float-delay' as never]: floatDelay,
        } as CSSProperties
      }
      aria-label={`${typeof dayNumber === 'number' ? `第 ${dayNumber} 天，` : ''}${memory.date} 的回忆`}
    >
      <span aria-hidden="true" className="planet-atmo" />

      <div className="planet-core">
        {/* Surface texture: SVG filter with feTurbulence seeded by memory.id */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="planet-layer planet-rotate"
          style={{ mixBlendMode: 'overlay', opacity: 0.42 }}
        >
          <defs>
            <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency={baseFrequency}
                numOctaves={3}
                seed={seed % 10000}
                stitchTiles="stitch"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="12"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            rx="50"
            ry="50"
            filter={`url(#${filterId})`}
            fill="rgba(255,255,255,0.35)"
          />
        </svg>

        {/* Soft clouds / haze */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="planet-layer planet-rotate-slow"
          style={{ mixBlendMode: 'screen', opacity: 0.18, filter: 'blur(0.2px)' }}
        >
          <defs>
            <filter id={cloudFilterId} x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency={cloudFrequency}
                numOctaves={2}
                seed={(seed + 1337) % 10000}
                stitchTiles="stitch"
                result="cloud"
              />
              <feColorMatrix
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.55 0
                "
              />
            </filter>
          </defs>
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            rx="50"
            ry="50"
            filter={`url(#${cloudFilterId})`}
            fill="rgba(255,255,255,0.55)"
          />
        </svg>

        {/* Rim light */}
        <span
          aria-hidden="true"
          className="planet-layer"
          style={{
            background:
              'radial-gradient(circle at 32% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 40%, rgba(0,0,0,0) 62%)',
            mixBlendMode: 'screen',
            opacity: 0.75,
          }}
        />
      </div>

      {showDayNumber && typeof dayNumber === 'number' ? (
        <span aria-hidden="true" className="planet-day">
          第 {dayNumber} 天
        </span>
      ) : null}
    </button>
  )
})


