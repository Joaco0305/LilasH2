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
  return data
}

export async function changeCart(action, payload) {
  await ensureSession()
  const { data, error } = await supabase.rpc('change_cart', { action, payload })
  if (error) throw error
  if (!data?.id || !Array.isArray(data.items)) throw new Error('Missing server confirmation')
  return data
}
