import { useLayoutEffect, useRef, useState } from 'react'
import { itemKey, productFor, whatsappUrl } from '../utils/cart.js'
import { money } from '../utils/format.js'
import { ORDER_CONFIRMATION_NOTICE } from '../config.js'
import Modal from './Modal.jsx'
import CartItem from './CartItem.jsx'

export default function CartDialog({ isOpen, session, items, total, savedName, savedNotes, busy, error, onRefresh, onSave, onPrepare, onClose, onChangeQuantity, onRemove, onBrowseMenu }) {
  const [draft, setDraft] = useState(null)
  const name = draft?.name ?? savedName
  const notes = draft?.notes ?? savedNotes
  const [saved, setSaved] = useState(false)
  const [sent, setSent] = useState(null)
  const closeRef = useRef(null)
  const controls = useRef(new Map())
  const pendingFocus = useRef(null)
  const showSent = sent && sent.session === session
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
  const save = async event => {
    event?.preventDefault()
    setSaved(false)
    const result = await onSave(name, notes)
    if (result.data) { setDraft(null); setSaved(true) }
    return result
  }
  const checkout = async () => {
    if (!items.length || busy) return
    const popup = window.open('about:blank', '_blank')
    if (popup) popup.opener = null
    const { data } = await onPrepare(name, notes)
    if (!data || !data.items.length) { popup?.close(); return }
    const url = whatsappUrl(data.items, data.name, data.notes, item => item.unitPrice)
    setDraft(null)
    setSaved(false)
    setSent({ items: data.items, name: data.name, notes: data.notes, session, url })
    if (popup) popup.location.replace(url)
  }
  return <Modal isOpen={isOpen} onClose={onClose} id="cart-dialog" className="cart-dialog" labelledBy="cart-title">
    <div className="cart-header"><div><p className="eyebrow">TUS FAVORITOS, JUNTOS</p><h2 id="cart-title">Mi pedido <span aria-hidden="true">♡</span></h2></div><button ref={closeRef} className="close" id="close-cart" aria-label="Cerrar pedido" onClick={onClose}>×</button></div>
    <div className="cart-body" aria-busy={busy}>
      {busy && <p role="status">Consultando tu pedido…</p>}
      {error && <div role="alert"><p>{error}</p><button className="primary" type="button" disabled={busy} onClick={onRefresh}>Actualizar pedido</button></div>}
      <div id="cart-items">{items.length ? items.map((item, index) => {
      const key = itemKey(item)
      return <CartItem key={key} item={item} product={productFor(item)} busy={busy}
        buttons={{ minus: trackButton(key, 'minus'), plus: trackButton(key, 'plus'), remove: trackButton(key, 'remove') }}
        onChangeQuantity={(quantity, action) => { pendingFocus.current = { index, action }; onChangeQuantity(key, quantity) }}
        onRemove={() => { pendingFocus.current = { index, action: 'remove' }; onRemove(key) }} />
    }) : !busy && !error && <div className="empty-state"><span aria-hidden="true">♡</span><h3>Tu próximo antojo te espera</h3><p>Agrega algo rico del menú para empezar.</p><button className="primary" id="browse-menu" onClick={onBrowseMenu}>Explorar el menú ↗</button></div>}</div>
      <form id="order-fields" hidden={!items.length && !savedName && !savedNotes} onSubmit={save}>
        <label className="field">Tu nombre <span>(opcional)</span><input id="customer-name" disabled={busy} maxLength={80} autoComplete="given-name" placeholder="¿Cómo te llamas?" value={name} onChange={event => { setDraft({ name: event.target.value, notes }); setSent(null); setSaved(false) }} /></label>
        <label className="field">Notas para tu pedido <span>(opcional)</span><textarea id="order-notes" disabled={busy} rows="3" maxLength={500} placeholder="Por ejemplo: el café sin azúcar" value={notes} onChange={event => { setDraft({ name, notes: event.target.value }); setSent(null); setSaved(false) }} /></label>
        <p className="order-help">Se guardan en tu carrito al pulsar guardar o enviar por WhatsApp. Vacía los campos y guarda para borrar estos datos.</p>
        <button className="primary" id="save-order" type="submit" disabled={busy}>Guardar datos del pedido</button>
        {saved && <p role="status">Datos guardados.</p>}
      </form>
    </div>
    <div className="cart-footer">
      <div className="total"><span>Total estimado</span><strong id="cart-total">{money(total)}</strong></div>
      <p id="order-confirmation-notice">{ORDER_CONFIRMATION_NOTICE} El envío, si corresponde, se confirma aparte.</p>
      <p className="order-help">Al continuar, se prepara tu solicitud y se vacía el carrito para el siguiente pedido.</p>
      <button id="checkout" className="primary whatsapp" disabled={!items.length || busy || Boolean(error)} aria-describedby="order-confirmation-notice" onClick={checkout}>Enviar pedido por WhatsApp <span aria-hidden="true">↗</span></button>
      <p id="checkout-status" role="status" hidden={!showSent}>Tu solicitud está lista para enviar. Confirma el envío del mensaje en WhatsApp y espera la confirmación de la cafetería. Si no se abrió, usa el enlace de abajo.</p>
      <a id="checkout-fallback" hidden={!showSent} href={sent?.url} target="_blank" rel="noopener noreferrer">Abrir mi pedido en WhatsApp ↗</a>
    </div>
  </Modal>
}
