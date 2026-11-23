import { useEffect, useState } from 'react'
import { loadHistory } from '../services/cart.js'
import { money } from '../utils/format.js'
import { details, whatsappUrl } from '../utils/cart.js'

export default function OrderHistory({ version }) {
  const [orders,setOrders] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  const [attempt,setAttempt] = useState(0)
  useEffect(() => {
    let active=true
    loadHistory().then(data=>{ if(active){setOrders(data);setError('')} })
      .catch(()=>{if(active)setError('No pudimos cargar tus solicitudes anteriores.')})
      .finally(()=>{if(active)setLoading(false)})
    return ()=>{active=false}
  },[version,attempt])
  return <section aria-labelledby="history-title" className="order-history">
    <h3 id="history-title">Mis solicitudes anteriores</h3>
    <p className="order-help">Últimas 50 solicitudes de esta sesión. Preparar el mensaje no confirma su envío ni la aceptación de la cafetería.</p>
    {loading && <p role="status">Cargando historial…</p>}
    {error && <p role="alert">{error} <button type="button" onClick={()=>{setLoading(true);setAttempt(n=>n+1)}}>Reintentar historial</button></p>}
    {!loading && !error && !orders.length && <p>Aún no tienes solicitudes preparadas.</p>}
    {orders.map(order=><details key={order.id} className="history-order">
      <summary>Solicitud {order.id.slice(0,8)} · {money(order.total)}</summary>
      <p>{new Date(order.created_at).toLocaleString('es-BO')} · Preparada</p>
      {order.name && <p>Nombre: {order.name}</p>}
      {order.notes && <p>Notas: {order.notes}</p>}
      <ul>{order.items.map(item=><li key={item.position}>{item.quantity} × {item.name} · {money(item.unitPrice*item.quantity)}<br/>{details(item)}</li>)}</ul>
      <a target="_blank" rel="noopener noreferrer" href={whatsappUrl(order.items,order.name,order.notes,item=>item.unitPrice)}>Abrir esta solicitud en WhatsApp ↗</a>
    </details>)}
  </section>
}
