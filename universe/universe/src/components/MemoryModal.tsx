import { AnimatePresence, motion } from 'framer-motion'
import type { Memory } from '../lib/types'

export function MemoryModal({
  memory,
  onClose,
}: {
  memory: Memory | null
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {memory ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="关闭"
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative mx-4 w-[min(92vw,420px)] rounded-2xl border border-white/10 bg-white/8 p-5 text-white shadow-glass-sm backdrop-blur-xl"
            initial={{ y: 18, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-white/70">{memory.type}</div>
                <div className="mt-1 text-base font-semibold tracking-wide">
                  {memory.date}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 active:scale-[0.98]"
              >
                关闭
              </button>
            </div>

            <div className="mt-4 whitespace-pre-wrap text-[15px] leading-6 text-white/90">
              {memory.content}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
              {typeof memory.mood_score === 'number' ? (
                <span>心情 {memory.mood_score}/100</span>
              ) : null}
              {typeof memory.importance === 'number' ? (
                <span>· 重要度 {memory.importance}/10</span>
              ) : null}
              {memory.has_ring ? <span>· 有行星环</span> : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}


