import { useLayoutEffect, useRef, useState } from 'react'
import { itemKey, productFor, whatsappUrl } from '../utils/cart.js'
import { money } from '../utils/format.js'
import Modal from './Modal.jsx'
import CartItem from './CartItem.jsx'

export default function CartDialog({ isOpen, session, items, total, onClose, onChangeQuantity, onRemove, onBrowseMenu }) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [sent, setSent] = useState(null)
  const closeRef = useRef(null)
  const controls = useRef(new Map())
  const pendingFocus = useRef(null)
  const showSent = sent && sent.items === items && sent.name === name && sent.notes === notes && sent.session === session
  useLayoutEffect(() => {
    if (!pendingFocus.current) return
    const { index, action } = pendingFocus.current
    const next = items[Math.min(index, items.length - 1)]
    const button = next && controls.current.get(`${itemKey(next)}:${action}`)
    ;(button || closeRef.current)?.focus()
    pendingFocus.current = null
  }, [items])
  const trackButton = (key, action) => node => {
    const id = `${key}:${action}`
    if (node) controls.current.set(id, node)
    else controls.current.delete(id)
  }
  const checkout = () => {
    if (!items.length) return
    const url = whatsappUrl(items, name, notes)
    setSent({ items, name, notes, session, url })
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  return <Modal isOpen={isOpen} onClose={onClose} id="cart-dialog" className="cart-dialog" labelledBy="cart-title">
    <div className="cart-header"><div><p className="eyebrow">TUS FAVORITOS, JUNTOS</p><h2 id="cart-title">Mi pedido <span aria-hidden="true">♡</span></h2></div><button ref={closeRef} className="close" id="close-cart" aria-label="Cerrar pedido" onClick={onClose}>×</button></div>
    <div className="cart-body"><div id="cart-items">{items.length ? items.map((item, index) => {
      const key = itemKey(item)
      return <CartItem key={key} item={item} product={productFor(item)}
        buttons={{ minus: trackButton(key, 'minus'), plus: trackButton(key, 'plus'), remove: trackButton(key, 'remove') }}
        onChangeQuantity={(quantity, action) => { pendingFocus.current = { index, action }; onChangeQuantity(key, quantity) }}
        onRemove={() => { pendingFocus.current = { index, action: 'remove' }; onRemove(key) }} />
    }) : <div className="empty-state"><span aria-hidden="true">♡</span><h3>Tu próximo antojo te espera</h3><p>Agrega algo rico del menú para empezar.</p><button className="primary" id="browse-menu" onClick={onBrowseMenu}>Explorar el menú ↗</button></div>}</div>
      <div id="order-fields" hidden={!items.length}><label className="field">Tu nombre <span>(opcional)</span><input id="customer-name" maxLength={80} autoComplete="given-name" placeholder="¿Cómo te llamas?" value={name} onChange={event => { setName(event.target.value); setSent(null) }} /></label><label className="field">Notas para tu pedido <span>(opcional)</span><textarea id="order-notes" rows="3" maxLength={500} placeholder="Por ejemplo: el café sin azúcar" value={notes} onChange={event => { setNotes(event.target.value); setSent(null) }} /></label></div>
    </div>
    <div className="cart-footer"><div className="total"><span>Total del pedido</span><strong id="cart-total">{money(total)}</strong></div><p>Coordinaremos disponibilidad, entrega o recojo por WhatsApp. El envío, si corresponde, se confirma aparte.</p><button id="checkout" className="primary whatsapp" disabled={!items.length} onClick={checkout}>Enviar pedido por WhatsApp <span aria-hidden="true">↗</span></button><p id="checkout-status" role="status" hidden={!showSent}>Tu pedido está listo. Confirma el envío del mensaje en WhatsApp. Si no se abrió, usa el enlace de abajo.</p><a id="checkout-fallback" hidden={!showSent} href={sent?.url} target="_blank" rel="noopener noreferrer">Abrir mi pedido en WhatsApp ↗</a></div>
  </Modal>
}
