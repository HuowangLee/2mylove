import { clamp, hashStringToUint32 } from './hash'

export function moodToHue(moodScore: number) {
  // 0 -> cold (210), 100 -> warm (18)
  const t = clamp(moodScore, 0, 100) / 100
  return 210 + (18 - 210) * t
}

export function hashToHue(input: string) {
  const h = hashStringToUint32(input)
  return h % 360
}


