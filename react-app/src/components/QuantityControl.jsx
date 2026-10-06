export default function QuantityControl({ value, min = 1, max = 99, onChange, label = '', detail = false, buttons }) {
  return <div className="quantity" aria-label={detail ? 'Cantidad' : undefined}>
    <button ref={buttons?.minus} id={detail ? 'detail-minus' : undefined} aria-label={`Reducir cantidad${label ? ` de ${label}` : ''}`} disabled={value <= min} onClick={() => onChange(value - 1, 'minus')}>−</button>
    <output id={detail ? 'detail-quantity' : undefined} aria-label={detail ? undefined : 'Cantidad'} aria-live={detail ? 'polite' : undefined}>{value}</output>
    <button ref={buttons?.plus} id={detail ? 'detail-plus' : undefined} aria-label={`Aumentar cantidad${label ? ` de ${label}` : ''}`} disabled={value >= max} onClick={() => onChange(value + 1, 'plus')}>+</button>
  </div>
}
