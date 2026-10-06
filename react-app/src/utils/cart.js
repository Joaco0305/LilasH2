import { PRODUCTS, BOBAS, SIZES } from '../data/menu.js'
import { STORAGE_KEY, WHATSAPP_NUMBER } from '../config.js'
import { money } from './format.js'

export const productFor = item => PRODUCTS.find(product => product.id === item.id)
export const itemKey = item => JSON.stringify([item.id, item.size, item.extra, item.included, item.base, item.temperature])
export const unitPrice = item => productFor(item).prices[item.size] + (item.extra ? 5 : 0)
export const cartTotal = items => items.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0)
export const initialSelection = product => ({
  id: product.id, size: Object.keys(product.prices)[0], quantity: 1, extra: '',
  included: product.category === 'boba' ? 'Tapioca' : '',
  base: product.group === 'Smoothies' ? 'Leche' : '',
  temperature: product.group === 'Té de perlas' ? 'Frío' : '',
})

export function validItem(item) {
  if (!item || typeof item !== 'object') return false
  const product = productFor(item)
  return Boolean(product && Object.hasOwn(product.prices, item.size)
    && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99
    && (item.extra === '' || (product.canBoba && BOBAS.includes(item.extra)))
    && (product.category === 'boba' ? BOBAS.includes(item.included) : item.included === '')
    && (product.group === 'Smoothies' ? ['Leche', 'Agua'].includes(item.base) : item.base === '')
    && (product.group === 'Té de perlas' ? ['Frío', 'Caliente'].includes(item.temperature) : item.temperature === ''))
}

export function readCart(storage) {
  try {
    const saved = JSON.parse((storage ?? window.localStorage).getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter(validItem).slice(0, 100) : []
  } catch { return [] }
}

export function persistCart(items, storage) {
  try { (storage ?? window.localStorage).setItem(STORAGE_KEY, JSON.stringify(items)) }
  catch { /* El carrito también funciona sin almacenamiento local. */ }
}

export function addItem(items, selection) {
  const key = itemKey(selection)
  const existing = items.find(item => itemKey(item) === key)
  if (existing && existing.quantity + selection.quantity > 99) {
    return { items, error: 'Puedes agregar hasta 99 unidades de esta combinación.' }
  }
  return {
    items: existing
      ? items.map(item => itemKey(item) === key ? { ...item, quantity: item.quantity + selection.quantity } : item)
      : [...items, { ...selection }],
    error: '',
  }
}

export function changeQuantity(items, key, quantity) {
  return quantity <= 0 ? items.filter(item => itemKey(item) !== key)
    : items.map(item => itemKey(item) === key ? { ...item, quantity: Math.min(99, Math.max(1, quantity)) } : item)
}

export function details(item) {
  return [item.size === 'U' ? 'Unidad' : `${SIZES[item.size]} (${item.size})`,
    item.base && `Con ${item.base.toLowerCase()}`, item.temperature,
    item.included && `Bobas incluidas: ${item.included}`,
    item.extra && `Extra bobas: ${item.extra} (+Bs 5.00 por bebida)`].filter(Boolean).join(' · ')
}

export function buildMessage(items, name = '', notes = '') {
  return ['¡Hola, Lilas! 🌸 Quisiera hacer este pedido:', name.trim() ? `\nNombre: ${name.trim()}` : '', '',
    ...items.map(item => `• ${item.quantity} × ${productFor(item).name}\n  ${details(item)}\n  Precio unitario: ${money(unitPrice(item))} · Subtotal: ${money(unitPrice(item) * item.quantity)}`),
    '', `*Total: ${money(cartTotal(items))}*`, notes.trim() ? `\nNotas: ${notes.trim()}` : '',
    '\n¿Me confirman disponibilidad y cómo coordinar la entrega o el recojo? El total no incluye envío. ¡Gracias!'].join('\n')
}

export const whatsappUrl = (items, name, notes) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(items, name, notes))}`
