export type MemoryType = 'daily' | 'challenge' | 'milestone' | 'travel'

export type Memory = {
  id: string
  date: string
  type: MemoryType
  content: string
  mood_score?: number
  importance?: number
  has_ring?: boolean
}

export type UniverseData = {
  anniversary_date: string
  memories: Memory[]
}


