const N8N_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || ''

export async function sendToN8N(event, payload) {
  if (!N8N_URL) { console.info('[n8n] webhook não configurado — payload:', { event, ...payload }); return }
  try {
    await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, timestamp: new Date().toISOString(), ...payload }),
    })
  } catch (e) {
    console.error('[n8n] erro ao enviar webhook:', e)
  }
}

// Events
export const EVENTS = {
  QUIZ_COMPLETED: 'quiz_completed',
  PLAN_SELECTED: 'plan_selected',
  PHOTO_UPLOADED: 'photo_uploaded',
  CARD_GENERATED: 'card_generated',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  CARD_DOWNLOADED: 'card_downloaded',
  SHARED: 'shared',
}

export function buildPayload(answers) {
  return {
    nome: answers.name,
    pais: answers.country,
    previsao_copa: answers.prediction,
    estilo_card: answers.style,
    plano: answers.plan,
    email: answers.email || '',
    telefone: answers.phone || '',
    plano_valor: answers.plan === 'familia' ? 30 : 10,
  }
}
