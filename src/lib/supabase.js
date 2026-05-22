import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = url && key ? createClient(url, key) : null

export async function saveOrder(data) {
  if (!supabase) { console.warn('[Supabase] não configurado'); return null }
  const { data: row, error } = await supabase
    .from('figurinha_orders')
    .insert([{
      nome: data.name,
      pais: data.country,
      previsao: data.prediction,
      estilo: data.style,
      plano: data.plan,
      email: data.email,
      telefone: data.phone,
      created_at: new Date().toISOString(),
      status: 'pending',
    }])
    .select()
    .single()
  if (error) console.error('[Supabase]', error)
  return row
}

export async function updateOrderStatus(id, status) {
  if (!supabase) return null
  const { error } = await supabase
    .from('figurinha_orders')
    .update({ status })
    .eq('id', id)
  if (error) console.error('[Supabase]', error)
}
