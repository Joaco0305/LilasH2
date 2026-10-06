import Link from './Link.jsx'
import { photoUrl } from '../utils/format.js'

export default function Hero() {
  return (
    <>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy"><p className="eyebrow"><span></span> HECHO PARA DISFRUTAR</p><h1 id="hero-title">Tu día merece<br />un poquito de <em>Lilas.</em></h1><p>Café que abraza, frozzis que alegran y bobas que sorprenden. Encuentra tu próximo antojo favorito.</p><Link className="primary" href="/menu">Encuentra tu antojo <span aria-hidden="true">↗</span></Link><div className="hero-note"><span aria-hidden="true">✳</span> Buenos momentos, sorbito a sorbito.</div></div>
      <div className="hero-photo"><img src={photoUrl('ice-latte')} alt="Café frío con leche y hielo, servido en un vaso" fetchPriority="high" /><div className="photo-label"><span>LA FELICIDAD SE SIRVE</span><strong>en tu vaso favorito.</strong></div><div className="round-stamp" aria-hidden="true">UN SORBITO<br /><span>♡</span><br />DE FELICIDAD</div></div>
    </section>
    <div className="flavor-strip" aria-hidden="true"><span>CAFÉ CON CARIÑO</span><b>✳</b><span>BOBAS & SONRISAS</span><b>✳</b><span>ANTOJOS DULCES</span><b>✳</b><span>MOMENTOS LILAS</span><b>✳</b></div>
    </>
  )
}
