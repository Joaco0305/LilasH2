import Link from './Link.jsx'
import { WHATSAPP_NUMBER } from '../config.js'

const currentYear = new Date().getFullYear()

export default function SiteFooter() {
  return (<footer><Link className="brand" href="/">LILAS<span>’</span></Link><p>Un poquito de felicidad en cada pedido.</p><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">Hablemos por WhatsApp ↗</a><small>© <span id="year">{currentYear}</span> Lilas. Hecho con cariño. · Fotografías ilustrativas.</small></footer>)
}
