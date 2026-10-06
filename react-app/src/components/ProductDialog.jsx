import { useState } from 'react'
import { BOBAS, SIZES } from '../data/menu.js'
import { initialSelection, unitPrice } from '../utils/cart.js'
import { money, photoUrl } from '../utils/format.js'
import Modal from './Modal.jsx'
import QuantityControl from './QuantityControl.jsx'

export default function ProductDialog({ product, onClose, onAdd }) {
  const [selection, setSelection] = useState(() => initialSelection(product))
  const change = (key, value) => setSelection(current => ({ ...current, [key]: value }))
  return <Modal isOpen onClose={onClose} id="product-dialog" className="product-dialog" labelledBy="product-name">
    <button className="close" id="close-product" aria-label="Cerrar producto" onClick={onClose}>×</button>
    <div id="product-detail"><div className="detail-image"><img src={photoUrl(product.photo)} alt="" /><span className="product-tag">Fotografía ilustrativa</span></div>
      <div className="detail-content"><p className="eyebrow">{product.group}</p><h2 id="product-name">{product.name}</h2><p className="detail-description">{product.description}</p>
        <span className="option-label">{selection.size === 'U' ? 'Presentación' : 'Elige tu tamaño'}</span>
        <div className="sizes" role="group" aria-label="Tamaño">{Object.entries(product.prices).map(([size, price]) => <button key={size} className={`size-option${selection.size === size ? ' active' : ''}`} data-size={size} aria-pressed={selection.size === size} aria-label={`${SIZES[size]}, ${money(price)}`} onClick={() => change('size', size)}>{size === 'U' ? 'Unidad' : size}<span>{money(price)}</span></button>)}</div>
        {selection.base && <><label className="option-label" htmlFor="drink-base">¿Con leche o agua?</label><select id="drink-base" value={selection.base} onChange={event => change('base', event.target.value)}>{['Leche', 'Agua'].map(value => <option key={value}>{value}</option>)}</select></>}
        {selection.temperature && <><label className="option-label" htmlFor="drink-temperature">¿Frío o caliente?</label><select id="drink-temperature" value={selection.temperature} onChange={event => change('temperature', event.target.value)}>{['Frío', 'Caliente'].map(value => <option key={value}>{value}</option>)}</select></>}
        {selection.included && <><label className="option-label" htmlFor="included-boba">Sabor de bobas incluidas</label><select id="included-boba" value={selection.included} onChange={event => change('included', event.target.value)}>{BOBAS.map(value => <option key={value}>{value}</option>)}</select></>}
        {product.canBoba && <><label className="option-label" htmlFor="extra-boba">¿Un extra de bobas? <span>+Bs 5.00</span></label><select id="extra-boba" value={selection.extra} onChange={event => change('extra', event.target.value)}><option value="">Sin extra de bobas</option>{BOBAS.map(value => <option key={value}>{value}</option>)}</select></>}
        <div className="detail-bottom"><QuantityControl detail value={selection.quantity} onChange={value => change('quantity', value)} /><button className="primary" id="add-to-cart" onClick={() => onAdd(selection)}>Agregar · {money(unitPrice(selection) * selection.quantity)}</button></div>
      </div>
    </div>
  </Modal>
}
