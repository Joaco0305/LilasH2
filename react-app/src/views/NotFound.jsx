import Link from '../components/Link.jsx'

export default function NotFound() {
  return <section className="route-message">
    <p className="eyebrow">404 · PÁGINA NO ENCONTRADA</p>
    <h1>Este camino no lleva a Lilas.</h1>
    <p>Puedes volver al inicio o encontrar tu próximo antojo en el menú.</p>
    <Link className="primary" href="/menu">Explorar el menú ↗</Link>
    <Link href="/">Volver al inicio</Link>
  </section>
}
