import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CARD_STYLES } from '../lib/cardGenerator'
import ProgressBar from './ProgressBar'

// Mapeamento de cada estilo com a imagem de referência real
const STYLE_META = {
  panini: {
    preview: '/previews/panini.png',
    label: 'Clássica Panini',
    desc: 'O clássico que nunca sai de moda',
    tag: '⚽ Tradicional',
    tagColor: '#009C3B',
    bg: 'linear-gradient(160deg, #f5e8c0, #e8d48a)',
    border: '#c9a030',
  },
  neon: {
    preview: '/previews/neon.png',
    label: 'Neon Copa 2026',
    desc: 'Futurista e ultralimitado',
    tag: '⚡ Premium',
    tagColor: '#00FF87',
    bg: 'linear-gradient(160deg, #020d08, #053318)',
    border: '#00FF87',
  },
  retro: {
    preview: '/previews/retro.png',
    label: 'Copa Retrô',
    desc: 'Viagem ao passado dourado',
    tag: '🕰️ Vintage',
    tagColor: '#c9a030',
    bg: 'linear-gradient(160deg, #3a2200, #6b3d00)',
    border: '#c9a030',
  },
  legendary: {
    preview: '/previews/legendary.png',
    label: 'Lendária',
    desc: 'Para os imortais do futebol',
    tag: '👑 Exclusivo',
    tagColor: '#FFD700',
    bg: 'linear-gradient(160deg, #0a0800, #2a1f00)',
    border: '#FFD700',
  },
  fut: {
    preview: '/previews/fut.png',
    label: 'FIFA Ultimate Team',
    desc: 'O card mais icônico do futebol',
    tag: '🎮 FUT',
    tagColor: '#FFD700',
    bg: 'linear-gradient(160deg, #050505, #111108)',
    border: '#FFD700',
  },
}

const ORDER = ['panini', 'neon', 'retro', 'legendary', 'fut']

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } },
}

export default function QuizStyle({ answers, updateAnswer, goNext, goBack }) {
  const selected = answers.style
  const [hovered, setHovered] = useState(null)

  // Estilo em destaque: o que está hovered, ou o selecionado, ou null
  const featured = hovered || selected

  return (
    <div
      className="min-h-dvh w-full flex flex-col items-center py-8 px-4"
      style={{ overflowY: 'auto' }}
    >
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <ProgressBar current={3} total={5} />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-ng/60 font-raj font-semibold text-sm tracking-widest uppercase mb-3">
            Pergunta 3
          </p>
          <h2 className="font-bebas text-white text-4xl sm:text-5xl">
            Qual estilo da sua figurinha?
          </h2>
          <p className="text-white/40 font-raj mt-2 text-sm">
            Passe o mouse ou toque para ver o preview — depois clique em Continuar
          </p>
        </motion.div>

        {/* Layout: preview em cima no mobile, lado a lado no desktop */}
        <div className="flex flex-col-reverse lg:flex-row gap-6 w-full items-start justify-center">

          {/* Grade de cards */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-1 gap-2 w-full lg:max-w-xs shrink-0"
          >
            {ORDER.map(id => {
              const meta = STYLE_META[id]
              const isSelected = selected === id
              const isHovered = hovered === id

              return (
                <motion.button
                  key={id}
                  variants={item}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateAnswer('style', id)}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(id)}
                  onBlur={() => setHovered(null)}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200
                    focus:outline-none text-left relative overflow-hidden"
                  style={{
                    background: isSelected
                      ? `rgba(0,0,0,0.82)`
                      : isHovered
                        ? 'rgba(0,0,0,0.75)'
                        : 'rgba(0,0,0,0.65)',
                    border: `1.5px solid ${isSelected
                      ? meta.border
                      : isHovered
                        ? meta.border + '88'
                        : 'rgba(255,255,255,0.15)'}`,
                    boxShadow: isSelected ? `0 0 20px ${meta.border}44` : 'none',
                  }}
                >
                  {/* Mini thumb */}
                  <div
                    className="shrink-0 rounded-xl overflow-hidden"
                    style={{ width: 52, height: 72 }}
                  >
                    <img
                      src={meta.preview}
                      alt={meta.label}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-raj font-bold text-sm"
                        style={{ color: isSelected ? meta.border : 'rgba(255,255,255,0.85)' }}
                      >
                        {meta.label}
                      </span>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-xs font-raj font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: meta.border + '22', color: meta.border }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </div>
                    <p className="font-raj text-xs text-white/35 truncate">{meta.desc}</p>
                    <span
                      className="inline-block mt-1 text-[10px] font-raj font-bold px-2 py-0.5 rounded-full"
                      style={{ background: meta.tagColor + '18', color: meta.tagColor }}
                    >
                      {meta.tag}
                    </span>
                  </div>

                  {/* Arrow indicator */}
                  <span
                    className="text-white/20 shrink-0 transition-all duration-200"
                    style={{ color: isSelected || isHovered ? meta.border : undefined, opacity: isSelected || isHovered ? 1 : 0.3 }}
                  >
                    →
                  </span>
                </motion.button>
              )
            })}
          </motion.div>

          {/* Preview em destaque */}
          <div className="flex-1 flex flex-col items-center gap-4 w-full lg:max-w-sm">
            <AnimatePresence mode="wait">
              {featured ? (
                <motion.div
                  key={featured}
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -8 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  className="flex flex-col items-center gap-3 w-full"
                >
                  {/* Card image */}
                  <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                      width: '100%',
                      maxWidth: 280,
                      boxShadow: `0 0 40px ${STYLE_META[featured].border}44, 0 0 80px ${STYLE_META[featured].border}18`,
                      border: `2px solid ${STYLE_META[featured].border}44`,
                    }}
                  >
                    <img
                      src={STYLE_META[featured].preview}
                      alt={STYLE_META[featured].label}
                      className="w-full h-auto block"
                    />

                    {/* Holographic shimmer overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%)',
                        backgroundSize: '200% 200%',
                        animation: 'shimmer 3s infinite',
                      }}
                    />
                  </div>

                  {/* Label + tag */}
                  <div className="text-center">
                    <p
                      className="font-bebas text-2xl"
                      style={{ color: STYLE_META[featured].border }}
                    >
                      {STYLE_META[featured].label}
                    </p>
                    <p className="font-raj text-sm text-white/45">{STYLE_META[featured].desc}</p>
                  </div>

                  {/* Select button (só aparece se não estiver selecionado) */}
                  {selected !== featured && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateAnswer('style', featured)}
                      className="px-6 py-2 rounded-xl font-raj font-bold text-sm transition-all"
                      style={{
                        background: STYLE_META[featured].border + '18',
                        color: STYLE_META[featured].border,
                        border: `1px solid ${STYLE_META[featured].border}44`,
                      }}
                    >
                      Selecionar este estilo
                    </motion.button>
                  )}

                  {selected === featured && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 font-raj font-bold text-sm px-4 py-2 rounded-xl"
                      style={{
                        background: STYLE_META[featured].border + '18',
                        color: STYLE_META[featured].border,
                        border: `1px solid ${STYLE_META[featured].border}44`,
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Selecionado!
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center gap-3 py-16 text-center"
                >
                  <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-3xl">
                    🎴
                  </div>
                  <p className="font-raj text-white/30 text-sm">
                    Passe o mouse em um estilo<br />para ver o preview
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-3 w-full max-w-sm mt-8">
          <button
            onClick={goBack}
            className="flex-none px-5 py-3.5 rounded-xl border border-white/10 text-white/50
              hover:text-white/80 hover:border-white/20 transition-all font-raj font-bold text-sm"
          >
            ← Voltar
          </button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={goNext}
            disabled={!selected}
            className="flex-1 btn-primary py-3.5 rounded-xl text-lg
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {selected
              ? `Continuar →`
              : 'Escolha um estilo'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
