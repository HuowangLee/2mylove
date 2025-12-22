import './App.css'
import { useMemo, useRef, useState } from 'react'
import { Planet } from './components/Planet'
import { MemoryModal } from './components/MemoryModal'
import { StarfieldCanvas } from './components/StarfieldCanvas'
import { useUniverseData } from './hooks/useUniverseData'
import { usePanZoom } from './hooks/usePanZoom'
import { computePlanetPoses } from './lib/galaxy'
import { dayNumberFrom, daysSince, toISODateString } from './lib/date'
import { dailyQuote } from './lib/quotes'
import type { Memory } from './lib/types'

function App() {
  const { data, state } = useUniverseData()
  const { panZoom, handlers } = usePanZoom()
  const [selected, setSelected] = useState<Memory | null>(null)
  const [showDayNumbers, setShowDayNumbers] = useState(false)
  const dragRef = useRef({ down: false, moved: false, sx: 0, sy: 0 })

  const poseById = useMemo(() => {
    if (!data) return new Map<string, { x: number; y: number }>()
    const poses = computePlanetPoses(data.memories)
    const map = new Map<string, { x: number; y: number }>()
    for (const p of poses) map.set(p.id, { x: p.x, y: p.y })
    return map
  }, [data])

  const dayCount = useMemo(() => {
    if (!data) return 0
    return Math.max(0, daysSince(data.anniversary_date))
  }, [data])

  const quote = useMemo(() => dailyQuote(toISODateString(new Date())), [])

  return (
    <div className="relative h-full w-full overflow-hidden text-white">
      <StarfieldCanvas seedKey={data?.anniversary_date ?? 'universe'} panZoom={panZoom} />

      {/* Top HUD */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-20 p-4">
        <div className="mx-auto flex w-full max-w-[520px] flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-white/70">从相遇到现在</div>
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold tracking-wide">
                {dayCount} 天
              </div>
              <label className="pointer-events-auto inline-flex select-none items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-white/80"
                  checked={showDayNumbers}
                  onChange={(e) => setShowDayNumbers(e.target.checked)}
                />
                显示天数
              </label>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 backdrop-blur-md">
            {quote}
          </div>
        </div>
      </div>

      {/* Status */}
      {state.status === 'loading' ? (
        <div className="fixed inset-0 z-10 flex items-center justify-center text-white/70">
          正在读取 data.json…
        </div>
      ) : null}
      {state.status === 'error' ? (
        <div className="fixed inset-0 z-10 flex items-center justify-center px-6 text-center text-white/70">
          <div>
            <div className="text-base font-semibold text-white/85">加载失败</div>
            <div className="mt-2 text-sm leading-6">
              {state.error}
              <br />
              请检查 `public/data.json` 的 JSON 结构是否正确。
            </div>
          </div>
        </div>
      ) : null}

      {/* Galaxy viewport */}
      <div
        className="fixed inset-0 z-10 touch-none"
        {...handlers}
        onPointerDown={(e) => {
          dragRef.current = { down: true, moved: false, sx: e.clientX, sy: e.clientY }
          handlers.onPointerDown(e)
        }}
        onPointerMove={(e) => {
          const d = dragRef.current
          if (d.down) {
            const dx = e.clientX - d.sx
            const dy = e.clientY - d.sy
            if (Math.hypot(dx, dy) > 6) d.moved = true
          }
          handlers.onPointerMove(e)
        }}
        onPointerUp={(e) => {
          dragRef.current.down = false
          // reset moved shortly after to allow taps
          setTimeout(() => {
            dragRef.current.moved = false
          }, 0)
          handlers.onPointerUp(e)
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate3d(${panZoom.x}px, ${panZoom.y}px, 0) scale(${panZoom.scale})`,
            transformOrigin: '50% 50%',
          }}
        >
          {data
            ? data.memories.map((m) => {
                const pose = poseById.get(m.id)
                if (!pose) return null
                return (
                  <div
                    key={m.id}
                    className="absolute left-1/2 top-1/2"
                    style={{ transform: `translate3d(${pose.x}px, ${pose.y}px, 0)` }}
                  >
                    <Planet
                      memory={m}
                      dayNumber={
                        data?.anniversary_date
                          ? dayNumberFrom(data.anniversary_date, m.date)
                          : undefined
                      }
                      showDayNumber={showDayNumbers}
                      onClick={(mm) => {
                        if (dragRef.current.moved) return
                        setSelected(mm)
                      }}
                    />
                  </div>
                )
              })
            : null}
        </div>
      </div>

      <MemoryModal memory={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

export default App
