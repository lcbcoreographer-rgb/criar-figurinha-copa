import { useState } from 'react'
import { motion } from 'framer-motion'
import ProgressBar from './ProgressBar'
import { sendToN8N, EVENTS, buildPayload } from '../lib/webhooks'

const PLANS = [
  {
    id: 'solo',
    name: 'Craque Solo',
    price: 'R$10',
    badge: null,
    features: ['1 figurinha personalizada', 'Download em alta resolução', 'Wallpaper de celular', 'Compartilhar nas redes'],
    cta: 'ESCOLHER SOLO',
    color: '#00FF87',
    gradient: 'linear-gradient(135deg, rgba(0,255,135,0.06), rgba(0,255,135,0.02))',
    border: 'rgba(0,255,135,0.2)',
    glow: '0 0 30px rgba(0,255,135,0.1)',
  },
  {
    id: 'familia',
    name: 'Família Campeã',
    price: 'R$30',
    badge: '⭐ MAIS ESCOLHIDO',
    features: ['Até 5 figurinhas', 'Pack completo da família', 'Cards individuais de cada um', 'Figurinha coletiva da família', 'Download em alta resolução', 'Todos os wallpapers'],
    cta: 'ESCOLHER FAMÍLIA',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.03))',
    border: 'rgba(255,215,0,0.35)',
    glow: '0 0 50px rgba(255,215,0,0.15), 0 0 100px rgba(255,215,0,0.05)',
  },
]

export default function PlanSelection({ answers, updateAnswer, goNext, goBack }) {
  const [selected, setSelected] = useState(answers.plan || '')

  const pick = (id) => {
    setSelected(id)
    updateAnswer('plan', id)
    sendToN8N(EVENTS.PLAN_SELECTED, buildPayload({ ...answers, plan: id }))
    setTimeout(goNext, 300)
  }

  return (
    <div className="screen-base py-8">
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center gap-8">
        <ProgressBar current={5} total={5} />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-ng/60 font-raj font-semibold text-sm tracking-widest uppercase mb-3">Último passo</p>
          <h2 className="font-bebas text-white text-4xl sm:text-5xl">Escolha seu plano</h2>
          <p className="text-white/40 font-raj mt-2">Desbloqueie sua figurinha oficial</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5 w-full">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: 'spring' }}
              onClick={() => pick(plan.id)}
              className="relative cursor-pointer rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300"
              style={{
                background: plan.gradient,
                border: `1px solid ${selected === plan.id ? plan.color : plan.border}`,
                boxShadow: selected === plan.id ? plan.glow + ', 0 0 0 2px ' + plan.color : plan.glow,
              }}
            >
              {/* Best seller badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-gd text-black text-xs font-raj font-black px-4 py-1 rounded-full tracking-wider whitespace-nowrap">
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex justify-between items-start mt-2">
                <div>
                  <h3 className="font-bebas text-2xl" style={{ color: plan.color }}>{plan.name}</h3>
                  <p className="text-white/40 font-raj text-sm">
                    {plan.id === 'solo' ? 'Para você brilhar' : 'Para a família toda brilhar'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bebas text-4xl" style={{ color: plan.color }}>{plan.price}</div>
                  <div className="text-white/30 font-raj text-xs">pagamento único</div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${plan.color}44, transparent)` }} />

              {/* Features */}
              <ul className="flex flex-col gap-2">
                {plan.features.map((f, fi) => (
                  <motion.li
                    key={fi}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 + fi * 0.05 }}
                    className="flex items-center gap-2.5 font-raj text-sm"
                  >
                    <span className="text-base" style={{ color: plan.color }}>✓</span>
                    <span className="text-white/75">{f}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className="w-full py-3.5 rounded-xl font-raj font-black text-base tracking-wider mt-auto transition-all"
                style={{
                  background: selected === plan.id
                    ? `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`
                    : `${plan.color}18`,
                  color: selected === plan.id ? '#000' : plan.color,
                  border: `1px solid ${plan.color}44`,
                }}
              >
                {plan.cta}
              </button>

              {/* Selected indicator */}
              {selected === plan.id && (
                <motion.div
                  layoutId="plan-check"
                  className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: plan.color }}
                >
                  <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <button
          onClick={goBack}
          className="text-white/30 font-raj text-sm hover:text-white/60 transition-colors"
        >
          ← Voltar
        </button>
      </div>
    </div>
  )
}
