import { motion } from 'framer-motion'
import { CARD_STYLES } from '../lib/cardGenerator'

const GG_SOLO_URL    = 'https://comprar.criarfigurinhadacopa.online/checkout/v5/fnb12zqfrCV1PhlCBhsv'
const GG_FAMILIA_URL = 'https://comprar.criarfigurinhadacopa.online/checkout/v5/ZMf7bZQEFU0vWPmofnex'

const PLANS = [
  {
    id: 'solo',
    name: 'Craque Solo',
    price: 'R$10',
    image: '/card-solo.png',
    headline: 'Eternize este momento',
    subline: 'Sua foto transformada em um card oficial da Copa — para guardar, compartilhar e nunca esquecer.',
    features: [
      '1 figurinha personalizada',
      'Guia de personalização premium',
      'Passo a passo completo',
      'Suporte por WhatsApp',
    ],
    color: '#00FF87',
    gradient: 'linear-gradient(160deg, rgba(0,255,135,0.08) 0%, rgba(0,0,0,0) 100%)',
    border: 'rgba(0,255,135,0.3)',
    borderActive: '#00FF87',
    glow: '0 0 40px rgba(0,255,135,0.15)',
  },
  {
    id: 'familia',
    name: 'Família Campeã',
    price: 'R$29,87',
    image: '/card-familia.png',
    badge: '⭐ MAIS ESCOLHIDO',
    headline: 'Uma memória que fica para sempre',
    subline: 'Transforme toda a família em craques da Copa 2026. O presente mais épico que você pode dar.',
    features: [
      'Até 5 figurinhas personalizadas',
      'Álbum completo da família',
      'Guia de personalização premium',
      'Templates exclusivos família',
      'Suporte prioritário por WhatsApp',
    ],
    color: '#FFD700',
    gradient: 'linear-gradient(160deg, rgba(255,215,0,0.1) 0%, rgba(0,0,0,0) 100%)',
    border: 'rgba(255,215,0,0.35)',
    borderActive: '#FFD700',
    glow: '0 0 50px rgba(255,215,0,0.2), 0 0 100px rgba(255,215,0,0.08)',
  },
]

function StyleBadge({ styleId }) {
  const s = CARD_STYLES[styleId]
  if (!s) return null
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-raj font-bold px-3 py-1 rounded-full"
      style={{ background: s.accent + '18', color: s.accent, border: `1px solid ${s.accent}33` }}>
      🎴 {s.name}
    </span>
  )
}

export default function Checkout({ answers, updateAnswer, goNext, goBack }) {
  const buy = (plan) => {
    updateAnswer('plan', plan.id)

    // Meta Pixel
    try {
      const value = plan.id === 'familia' ? 29.87 : 10.00
      window.fbq?.('track', 'InitiateCheckout', {
        value, currency: 'BRL',
        content_ids: [plan.id], content_name: plan.name, num_items: 1,
      })
    } catch (_) {}

    // UTMify
    try {
      const value = plan.id === 'familia' ? 29.87 : 10.00
      window.utmify?.track('InitiateCheckout', {
        value, currency: 'BRL',
        contents: [{ id: plan.id, name: plan.name, quantity: 1, price: value }],
      })
    } catch (_) {}

    const url = plan.id === 'familia' ? GG_FAMILIA_URL : GG_SOLO_URL
    window.location.href = url
  }

  return (
    <div className="min-h-dvh w-full flex flex-col items-center py-10 px-4" style={{ overflowY: 'auto' }}>
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-ng/60 font-raj font-semibold text-sm tracking-widest uppercase mb-3">
            Último passo
          </p>
          <h2 className="font-bebas text-white text-4xl sm:text-5xl">Escolha seu plano</h2>
          <p className="text-white/40 font-raj mt-2">
            Após o pagamento você recebe o guia de personalização premium
          </p>
        </motion.div>

        {/* Resumo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 flex flex-wrap gap-3 items-center"
        >
          <div className="w-10 h-10 rounded-xl bg-ng/10 border border-ng/20 flex items-center justify-center text-xl shrink-0">🎴</div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 200 }}
              className="relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
              style={{
                background: 'rgba(0,0,0,0.7)',
                border: `1.5px solid ${plan.border}`,
                boxShadow: plan.glow,
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-gd text-black text-xs font-raj font-black px-4 py-1 rounded-full tracking-wider whitespace-nowrap shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Imagem */}
              <div className="relative w-full overflow-hidden" style={{ maxHeight: 260 }}>
                <img
                  src={plan.image}
                  alt={plan.name}
                  className="w-full object-cover object-top"
                  style={{ display: 'block' }}
                />
                {/* Gradiente sobre a imagem */}
                <div className="absolute inset-0" style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)`
                }} />
                {/* Preço sobreposto na imagem */}
                <div className="absolute bottom-3 right-4">
                  <span className="font-bebas text-4xl" style={{ color: plan.color, textShadow: `0 0 20px ${plan.color}88` }}>
                    {plan.price}
                  </span>
                  <p className="text-white/40 font-raj text-xs text-right">único</p>
                </div>
                {/* Nome do plano sobreposto */}
                <div className="absolute bottom-3 left-4">
                  <span className="font-bebas text-2xl" style={{ color: plan.color }}>{plan.name}</span>
                </div>
              </div>

              {/* Corpo do card */}
              <div className="flex flex-col gap-4 p-5 flex-1" style={{ background: plan.gradient }}>

                {/* Copy emocional */}
                <div>
                  <h3 className="font-bebas text-xl text-white leading-tight">{plan.headline}</h3>
                  <p className="font-raj text-sm text-white/55 mt-1 leading-relaxed">{plan.subline}</p>
                </div>

                {/* Divider */}
                <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${plan.color}44, transparent)` }} />

                {/* Features */}
                <ul className="flex flex-col gap-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 font-raj text-sm">
                      <span className="shrink-0 mt-0.5 font-bold" style={{ color: plan.color }}>✓</span>
                      <span className="text-white/75">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => buy(plan)}
                  className="w-full py-4 rounded-xl font-raj font-black text-lg tracking-wider
                    transition-all duration-200 relative overflow-hidden mt-auto"
                  style={{
                    background: `linear-gradient(135deg, ${plan.color}cc, ${plan.color})`,
                    color: '#000',
                    boxShadow: `0 0 30px ${plan.color}44`,
                  }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{
                    background: 'linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 60%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2.5s infinite',
                  }} />
                  <span className="relative z-10">COMPRAR AGORA</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <button onClick={goBack}
          className="text-white/25 font-raj text-sm hover:text-white/55 transition-colors text-center">
          ← Voltar
        </button>
      </div>
    </div>
  )
}
