import { details, unitPrice } from '../utils/cart.js'
import { money } from '../utils/format.js'
import QuantityControl from './QuantityControl.jsx'

export default function CartItem({ item, product, onChangeQuantity, onRemove, buttons }) {
  return <article className="cart-item"><div><h3>{product.name}</h3><p>{details(item)}</p><QuantityControl value={item.quantity} min={0} label={product.name} onChange={onChangeQuantity} buttons={buttons} /></div><div className="cart-item-price">{money(unitPrice(item) * item.quantity)}<button ref={node => buttons.remove(node)} className="remove-item" aria-label={`Quitar ${product.name}`} onClick={onRemove}>Quitar</button></div></article>
}
