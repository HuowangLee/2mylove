import type { Memory } from './types'
import { hashStringToUint32, mulberry32 } from './hash'

export type PlanetPose = {
  id: string
  x: number
  y: number
}

export function computePlanetPoses(memories: Memory[]): PlanetPose[] {
  // Nice distribution: golden-angle spiral + per-id jitter (deterministic).
  const golden = Math.PI * (3 - Math.sqrt(5)) // ~2.399963
  const spread = 120 // px step-ish

  return memories.map((m, i) => {
    const seed = hashStringToUint32(m.id)
    const rnd = mulberry32(seed)
    const angle = i * golden + rnd() * 0.9
    const radius = Math.sqrt(i + 1) * spread * (0.85 + rnd() * 0.3)
    const jitter = (rnd() - 0.5) * 40
    const x = Math.cos(angle) * radius + jitter
    const y = Math.sin(angle) * radius + (rnd() - 0.5) * 40
    return { id: m.id, x, y }
  })
}


