import { useCallback, useEffect, useRef, useState } from 'react'
import { itemKey, validItem } from '../utils/cart.js'
import { cartError, changeCart, loadCart } from '../services/cart.js'

const EMPTY = { id: null, items: [], total: 0, name: '', notes: '' }

export default function useCart() {
  const [cart, setCart] = useState(EMPTY)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const locked = useRef(false)
  const refresh = useCallback(async () => {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    try { setCart(await loadCart()); setError('') }
    catch (cause) { setError(cartError(cause)) }
    finally { locked.current = false; setBusy(false) }
  }, [])
  useEffect(() => {
    let active = true
    loadCart().then(data => { if (active) { setCart(data); setError('') } })
      .catch(cause => { if (active) setError(cartError(cause)) })
      .finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [])

  async function mutate(action, payload) {
    if (locked.current) return { error: 'Espera a que termine la operación anterior.' }
    locked.current = true
    setBusy(true)
    try {
      const data = await changeCart(action, payload)
      setCart(data)
      setError('')
      return { data }
    } catch (cause) {
      const message = cartError(cause)
      setError(message)
      return { error: message }
    } finally { locked.current = false; setBusy(false) }
  }

  const lineId = key => cart.items.find(item => itemKey(item) === key)?.lineId
  return {
    ...cart, busy, error, refresh,
    count: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    async add(selection) {
      if (!validItem(selection)) return 'Revisa las opciones del producto.'
      const result = await mutate('add', selection)
      return result.error
    },
    updateQuantity: (key, quantity) => mutate(quantity === 0 ? 'remove' : 'quantity', { lineId: lineId(key), quantity }),
    remove: key => mutate('remove', { lineId: lineId(key) }),
    save: (name, notes) => mutate('metadata', { name, notes }),
  }
}
