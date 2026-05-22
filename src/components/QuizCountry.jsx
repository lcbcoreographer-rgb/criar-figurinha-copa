import { motion } from 'framer-motion'
import ProgressBar from './ProgressBar'

const COUNTRIES = [
  { id: 'brasil',    label: 'Brasil',    code: 'br', color: '#009C3B' },
  { id: 'argentina', label: 'Argentina', code: 'ar', color: '#74ACDF' },
  { id: 'portugal',  label: 'Portugal',  code: 'pt', color: '#D0112B' },
  { id: 'franca',    label: 'França',    code: 'fr', color: '#003087' },
  { id: 'alemanha',  label: 'Alemanha',  code: 'de', color: '#FFCE00' },
  { id: 'espanha',   label: 'Espanha',   code: 'es', color: '#C60B1E' },
  { id: 'outro',     label: 'Outro',     code: null,  color: '#888' },
]

function FlagImg({ code, size = 48 }) {
  if (!code) return (
    <span style={{ fontSize: size * 0.75, lineHeight: 1 }}>🌍</span>
  )
  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={code}
      width={size}
      height={Math.round(size * 0.67)}
      className="rounded object-cover shadow-md"
      style={{ display: 'block' }}
      loading="lazy"
      onError={e => { e.currentTarget.style.display = 'none' }}
    />
  )
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

export default function QuizCountry({ answers, updateAnswer, goNext }) {
  const select = (id) => {
    updateAnswer('country', id)
    setTimeout(goNext, 300)
  }

  return (
    <div className="screen-base">
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        <ProgressBar current={1} total={5} />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-ng/60 font-raj font-semibold text-sm tracking-widest uppercase mb-3">Pergunta 1</p>
          <h2 className="font-bebas text-white text-4xl sm:text-5xl drop-shadow-lg"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
            Qual seleção você vai torcer?
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full"
        >
          {COUNTRIES.map(c => {
            const selected = answers.country === c.id
            return (
              <motion.button
                key={c.id}
                variants={item}
                whileTap={{ scale: 0.96 }}
                onClick={() => select(c.id)}
                className={`option-card p-4 flex flex-col items-center gap-3 group relative overflow-hidden
                  ${selected ? 'selected' : ''}`}
              >
                {/* Glow background when selected */}
                {selected && (
                  <motion.div
                    layoutId="country-glow"
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 40%, ${c.color}18 0%, transparent 70%)` }}
                  />
                )}

                {/* Flag */}
                <div className="flex items-center justify-center" style={{ height: 38 }}>
                  <motion.div
                    animate={selected ? { scale: 1.12 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    style={{
                      filter: selected ? `drop-shadow(0 0 8px ${c.color}88)` : 'none',
                      transition: 'filter 0.25s ease',
                    }}
                  >
                    <FlagImg code={c.code} size={52} />
                  </motion.div>
                </div>

                {/* Label */}
                <span
                  className="font-raj font-bold text-sm transition-colors duration-200"
                  style={{ color: selected ? c.color : 'rgba(255,255,255,0.75)' }}
                >
                  {c.label}
                </span>

                {/* Check */}
                {selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: c.color }}
                  >
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
