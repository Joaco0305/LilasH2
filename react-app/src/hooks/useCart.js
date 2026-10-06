import { useEffect, useState } from 'react'
import { addItem, cartTotal, changeQuantity, itemKey, persistCart, readCart } from '../utils/cart.js'

export default function useCart() {
  const [items, setItems] = useState(() => readCart())
  useEffect(() => { persistCart(items) }, [items])
  return {
    items, total: cartTotal(items), count: items.reduce((sum, item) => sum + item.quantity, 0),
    add(selection) {
      const result = addItem(items, selection)
      setItems(result.items)
      return result.error
    },
    updateQuantity: (key, quantity) => setItems(current => changeQuantity(current, key, quantity)),
    remove: key => setItems(current => current.filter(item => itemKey(item) !== key)),
  }
}
