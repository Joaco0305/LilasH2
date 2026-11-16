import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { PRODUCTS } from '../data/menu.js'

export default function useCatalog() {
  const [state, setState] = useState({ products: [], loading: true, error: '' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        if (!supabase) throw new Error('Missing configuration')
        const { data, error } = await supabase.from('products').select('id,name,category,can_boba,product_prices(size,price)')
        if (error) throw error
        const products = PRODUCTS.flatMap(original => {
          const remote = data.find(p => p.id === original.id)
          return remote?.product_prices.length ? [{ ...original, name: remote.name, category: remote.category,
            canBoba: remote.can_boba, prices: Object.fromEntries(Object.keys(original.prices)
              .filter(size => remote.product_prices.some(p => p.size === size))
              .map(size => [size, Number(remote.product_prices.find(p => p.size === size).price)])) }] : []
        })
        if (active) setState({ products, loading: false, error: '' })
      } catch {
        if (active) setState({ products: [], loading: false, error: 'No pudimos cargar el menú. Revisa tu conexión e inténtalo de nuevo.' })
      }
    }
    load()
    return () => { active = false }
  }, [attempt])
  return { ...state, retry: () => { setState(current => ({ ...current, loading: true, error: '' })); setAttempt(current => current + 1) } }
}
