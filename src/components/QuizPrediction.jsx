import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProgressBar from './ProgressBar'

const OPTIONS_BRASIL = [
  { id: 'oitavas', label: 'Oitavas',    emoji: '😐', pct: 4  },
  { id: 'quartas', label: 'Quartas',    emoji: '🙂', pct: 9  },
  { id: 'semi',    label: 'Semi Final', emoji: '😤', pct: 11 },
  { id: 'final',   label: 'Final',      emoji: '🔥', pct: 16 },
  { id: 'hexa',    label: 'HEXA! 🏆',  emoji: '🇧🇷', pct: 60 },
]

const OPTIONS_OUTRO = [
  { id: 'oitavas', label: 'Oitavas',    emoji: '😐', pct: 8  },
  { id: 'quartas', label: 'Quartas',    emoji: '🙂', pct: 18 },
  { id: 'semi',    label: 'Semi Final', emoji: '😤', pct: 24 },
  { id: 'final',   label: 'Final',      emoji: '🔥', pct: 28 },
  { id: 'campeao', label: 'CAMPEÃO! 🏆', emoji: '🌟', pct: 22 },
]

const COUNTRY_NAMES = {
  brasil: 'Brasil', argentina: 'Argentina', portugal: 'Portugal',
  franca: 'França', alemanha: 'Alemanha', espanha: 'Espanha', outro: 'seu time',
}

const HEXA_FACTS = {
  brasil:    '78% acreditam no HEXA',
  argentina: '65% acreditam no BI',
  portugal:  '71% acreditam no título',
  franca:    '69% acreditam no título',
  alemanha:  '62% acreditam no título',
  espanha:   '67% acreditam no título',
  outro:     '70% acreditam no título',
}

function AnimatedBar({ pct, selected, color = '#00FF87' }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setCurrent(pct), 300)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${current}%` }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          style={{ background: selected ? color : 'rgba(255,255,255,0.2)' }}
        />
      </div>
    </div>
  )
}

function FakeCounter({ target }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / 40
    const id = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(id) }
      else setVal(Math.floor(start))
    }, 25)
    return () => clearInterval(id)
  }, [target])
  return <>{val}%</>
}

export default function QuizPrediction({ answers, updateAnswer, goNext }) {
  const [selected, setSelected] = useState(answers.prediction || '')
  const country = answers.country || 'brasil'
  const isBrasil = country === 'brasil'
  const OPTIONS = isBrasil ? OPTIONS_BRASIL : OPTIONS_OUTRO
  const countryName = COUNTRY_NAMES[country] || 'seu time'
  const hexaFact = HEXA_FACTS[country] || HEXA_FACTS.outro

  const pick = (id) => {
    setSelected(id)
    updateAnswer('prediction', id)
    setTimeout(goNext, 600)
  }

  return (
    <div className="screen-base">
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        <ProgressBar current={2} total={5} />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-ng/60 font-raj font-semibold text-sm tracking-widest uppercase mb-3">Pergunta 2</p>
          <h2 className="font-bebas text-white text-4xl sm:text-5xl">
            {isBrasil ? 'O Brasil chega onde?' : `A ${countryName} chega onde?`}
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-ng/70 font-raj text-sm font-semibold mt-2"
          >
            ★ {hexaFact} ★
          </motion.p>
        </motion.div>

        <div className="flex flex-col gap-3 w-full">
          {OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, type: 'spring' }}
              onClick={() => pick(opt.id)}
              className={`option-card px-4 py-3 flex items-center gap-3
                ${selected === opt.id ? 'selected' : ''}`}
            >
              <span className="text-2xl w-8">{opt.emoji}</span>
              <span className="font-raj font-bold text-base text-white/80 flex-1 text-left">
                {opt.label}
              </span>
              <AnimatedBar pct={opt.pct} selected={selected === opt.id} />
              <span className="font-raj font-bold text-sm text-white/50 w-10 text-right">
                <FakeCounter target={opt.pct} />
              </span>
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-white/20 font-raj mt-4"
        >
          * Baseado em {(Math.floor(Math.random() * 3000) + 11000).toLocaleString('pt-BR')} respostas
        </motion.p>
      </div>
    </div>
  )
}
