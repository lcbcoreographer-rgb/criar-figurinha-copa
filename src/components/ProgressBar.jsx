import { motion } from 'framer-motion'

export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100)

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-white/30 font-raj font-semibold tracking-widest uppercase">
          Etapa {current} de {total}
        </span>
        <span className="text-xs text-ng/70 font-raj font-bold">{pct}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #00FF87, #0099FF)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
