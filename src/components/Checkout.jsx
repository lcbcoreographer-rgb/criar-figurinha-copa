import { useState } from 'react'
import { motion } from 'framer-motion'
import { CARD_STYLES } from '../lib/cardGenerator'
import { saveOrder } from '../lib/supabase'
import { sendToN8N, EVENTS, buildPayload } from '../lib/webhooks'

const GG_SOLO_URL    = 'https://comprar.criarfigurinhadacopa.online/checkout/v5/fnb12zqfrCV1PhlCBhsv'
const GG_FAMILIA_URL = 'https://comprar.criarfigurinhadacopa.online/checkout/v5/ZMf7bZQEFU0vWPmofnex'

const PLANS = [
  {
    id: 'solo',
    name: 'Craque Solo',
    price: 'R$10',
    description: 'Perfeito para você brilhar',
    features: [
      '1 figurinha personalizada',
      'Guia de personalização premium',
      'Passo a passo completo',
      'Suporte por WhatsApp',
    ],
    color: '#00FF87',
    gradient: 'linear-gradient(135deg, rgba(0,255,135,0.08), rgba(0,255,135,0.02))',
    border: 'rgba(0,255,135,0.25)',
    borderHover: '#00FF87',
    glow: '0 0 40px rgba(0,255,135,0.2)',
  },
  {
    id: 'familia',
    name: 'Família Campeã',
    price: 'R$29,87',
    description: 'Para toda a família brilhar',
    badge: '⭐ MAIS ESCOLHIDO',
    features: [
      'Até 5 figurinhas personalizadas',
      'Guia de personalização premium',
      'Passo a passo completo',
      'Pack completo para a família',
      'Templates exclusivos família',
      'Suporte prioritário por WhatsApp',
    ],
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.03))',
    border: 'rgba(255,215,0,0.35)',
    borderHover: '#FFD700',
    glow: '0 0 50px rgba(255,215,0,0.2), 0 0 100px rgba(255,215,0,0.08)',
  },
]

function StyleBadge({ styleId }) {
  const s = CARD_STYLES[styleId]
  if (!s) return null
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-raj font-bold px-3 py-1 rounded-full"
      style={{ background: s.accent + '18', color: s.accent, border: `1px solid ${s.accent}33` }}
    >
      🎴 {s.name}
    </span>
  )
}

export default function Checkout({ answers, updateAnswer, goNext, goBack }) {
  const [loading, setLoading] = useState(null) // 'solo' | 'familia' | null

  const buy = (plan) => {
    updateAnswer('plan', plan.id)

    const value = plan.id === 'familia' ? 29.87 : 10.00

    // Meta Pixel — InitiateCheckout
    try {
      window.fbq?.('track', 'InitiateCheckout', {
        value,
        currency: 'BRL',
        content_ids: [plan.id],
        content_name: plan.name,
        num_items: 1,
      })
    } catch (_) {}

    // UTMify — InitiateCheckout
    try {
      window.utmify?.track('InitiateCheckout', {
        value,
        currency: 'BRL',
        contents: [{ id: plan.id, name: plan.name, quantity: 1, price: value }],
      })
    } catch (_) {}

    const url = plan.id === 'familia' ? GG_FAMILIA_URL : GG_SOLO_URL
    window.location.href = url
  }

  return (
    <div
      className="min-h-dvh w-full flex flex-col items-center py-10 px-4"
      style={{ overflowY: 'auto' }}
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-ng/60 font-raj font-semibold text-sm tracking-widest uppercase mb-3">
            Último passo
          </p>
          <h2 className="font-bebas text-white text-4xl sm:text-5xl">Escolha seu plano</h2>
          <p className="text-white/40 font-raj mt-2">
            Após o pagamento você recebe o guia de personalização premium
          </p>
        </motion.div>

        {/* Resumo do pedido */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 flex flex-wrap gap-3 items-center"
        >
          <div className="w-10 h-10 rounded-xl bg-ng/10 border border-ng/20 flex items-center justify-center text-xl shrink-0">
            🎴
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bebas text-white text-xl leading-tight">{answers.name || 'Minha Figurinha'}</p>
            <div className="flex flex-wrap gap-2 items-center mt-0.5">
              <StyleBadge styleId={answers.style} />
              {answers.country && (
                <span className="text-xs text-white/35 font-raj capitalize">{answers.country}</span>
              )}
            </div>
          </div>
          <span className="text-xs text-white/30 font-raj shrink-0">Pedido pronto ✓</span>
        </motion.div>

        {/* Cards de plano */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 220 }}
              className="relative rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300"
              style={{
                background: plan.gradient,
                border: `1.5px solid ${plan.border}`,
                boxShadow: plan.id === 'familia' ? plan.glow : 'none',
              }}
            >
              {/* Badge mais escolhido */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gd text-black text-xs font-raj font-black px-4 py-1 rounded-full tracking-wider whitespace-nowrap shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header do plano */}
              <div className="flex justify-between items-start mt-1">
                <div>
                  <h3 className="font-bebas text-2xl leading-tight" style={{ color: plan.color }}>
                    {plan.name}
                  </h3>
                  <p className="text-white/40 font-raj text-xs mt-0.5">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-bebas text-4xl leading-none" style={{ color: plan.color }}>
                    {plan.price}
                  </div>
                  <div className="text-white/30 font-raj text-xs">pagamento único</div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px" style={{
                background: `linear-gradient(90deg, transparent, ${plan.color}44, transparent)`
              }} />

              {/* Features */}
              <ul className="flex flex-col gap-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 font-raj text-sm">
                    <span className="shrink-0 mt-0.5 font-bold" style={{ color: plan.color }}>✓</span>
                    <span className="text-white/70">{f}</span>
                  </li>
                ))}
              </ul>

              {/* Botão COMPRAR AGORA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => buy(plan)}
                disabled={loading !== null}
                className="w-full py-4 rounded-xl font-raj font-black text-lg tracking-wider
                  transition-all duration-200 relative overflow-hidden
                  disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${plan.color}dd, ${plan.color})`,
                  color: '#000',
                  boxShadow: `0 0 30px ${plan.color}44`,
                }}
              >
                {/* Shimmer */}
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 60%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2.5s infinite',
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading === plan.id ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                      Redirecionando...
                    </>
                  ) : (
                    <>COMPRAR AGORA</>
                  )}
                </span>
              </motion.button>
            </motion.div>
          ))}
        </div>


        <button
          onClick={goBack}
          className="text-white/25 font-raj text-sm hover:text-white/55 transition-colors text-center"
        >
          ← Voltar
        </button>
      </div>
    </div>
  )
}
