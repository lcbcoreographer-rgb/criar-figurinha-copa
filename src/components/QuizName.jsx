import { useState } from 'react'
import { motion } from 'framer-motion'
import ProgressBar from './ProgressBar'
import { CARD_STYLES } from '../lib/cardGenerator'

export default function QuizName({ answers, updateAnswer, goNext, goBack }) {
  const [name, setName] = useState(answers.name || '')
  const [focused, setFocused] = useState(false)
  const style = CARD_STYLES[answers.style] || CARD_STYLES.fut

  const submit = () => {
    if (name.trim().length < 2) return
    updateAnswer('name', name.trim())
    goNext()
  }

  return (
    <div className="screen-base">
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center gap-8">
        <ProgressBar current={4} total={5} />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-ng/60 font-raj font-semibold text-sm tracking-widest uppercase mb-3">Pergunta 4</p>
          <h2 className="font-bebas text-white text-4xl sm:text-5xl">
            Qual nome aparecerá na figurinha?
          </h2>
          <p className="text-white/40 font-raj mt-2">Como você quer ser chamado no card</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          {/* Preview */}
          <div
            className="w-full rounded-2xl p-5 mb-4 flex items-center justify-center relative overflow-hidden"
            style={{ background: '#111', minHeight: 80 }}
          >
            <div className="absolute inset-0 opacity-20"
              style={{ background: style.gradient }} />
            <motion.span
              key={name}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-bebas text-4xl relative z-10"
              style={{ color: style.accent, textShadow: `0 0 20px ${style.accent}66` }}
            >
              {name || 'SEU NOME'}
            </motion.span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value.slice(0, 18))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Ex: RONALDO, ANA, FAMILIA SILVA"
              maxLength={18}
              className="neon-input pr-16"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30 font-raj font-semibold">
              {name.length}/18
            </span>
          </div>

          <p className="text-xs text-white/30 font-raj mt-2 text-center">
            Será exibido em MAIÚSCULAS na sua figurinha
          </p>
        </motion.div>

        <div className="flex gap-3 w-full">
          <button
            onClick={goBack}
            className="flex-none px-5 py-3.5 rounded-xl border border-white/10 text-white/50
              hover:text-white/80 hover:border-white/20 transition-all font-raj font-bold text-sm"
          >
            ← Voltar
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={submit}
            disabled={name.trim().length < 2}
            className="flex-1 btn-primary py-3.5 rounded-xl text-lg disabled:opacity-30 disabled:cursor-not-allowed"
          >
            CONTINUAR →
          </motion.button>
        </div>
      </div>
    </div>
  )
}
