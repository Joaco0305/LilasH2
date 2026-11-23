import { supabase } from '../lib/supabase.js'

let sessionRequest
export async function ensureSession() {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.')
  if (!sessionRequest) {
    sessionRequest = (async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      if (!data.session) {
        const result = await supabase.auth.signInAnonymously()
        if (result.error) throw result.error
      }
    })().finally(() => { sessionRequest = null })
  }
  return sessionRequest
}

export function cartError(error) {
  if (!supabase) return 'Falta configurar la conexión con Supabase.'
  if (['23514', '23503', '22P02', '22023'].includes(error?.code)) return 'Revisa las opciones y la cantidad (máximo 99 por combinación).'
  if (error?.code === 'P0002') return 'Ese artículo ya no está disponible en tu carrito. Actualiza el pedido.'
  return 'No se pudo confirmar la operación. Revisa tu conexión y actualiza el pedido antes de intentarlo otra vez.'
}

export async function loadCart() {
  await ensureSession()
  const { data, error } = await supabase.rpc('get_cart')
  if (error) throw error
  const pending = localStorage.getItem('lilas-pending-order')
  if (pending) {
    const result = await supabase.from('order_history').select('id').eq('request_id', pending).limit(1)
    if (!result.error && result.data.length) localStorage.removeItem('lilas-pending-order')
  }
  return data
}

export async function changeCart(action, payload) {
  await ensureSession()
  const { data, error } = await supabase.rpc('change_cart', { action, payload })
  if (error) throw error
  if (!data?.id || !Array.isArray(data.items)) throw new Error('Missing server confirmation')
  return data
}

export async function prepareOrder(requestId, name, notes) {
  await ensureSession()
  const { data, error } = await supabase.rpc('prepare_order', { request_id: requestId, customer_name: name, customer_notes: notes })
  if (error) throw error
  if (!data?.order?.id || !data?.cart) throw new Error('Missing order confirmation')
  return data
}
