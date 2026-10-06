import Link from './Link.jsx'
export default function SiteHeader({ path, cartCount, onOpenCart }) {
  return (<>
  <div className="announcement">Un café, algo dulce y un momento para ti <span aria-hidden="true">✳</span></div>
  <header className="header">
    <Link className="brand" href="/" aria-label="Lilas, inicio">LILAS<span>’</span><small>COFFEE & GOOD MOMENTS</small></Link>
    <nav aria-label="Navegación principal"><Link href="/menu" aria-current={path === '/menu' ? 'page' : undefined}>Nuestro menú</Link><Link href="/historia" aria-current={path === '/historia' ? 'page' : undefined}>Nuestra historia</Link><Link href="/como-pedir" aria-current={path === '/como-pedir' ? 'page' : undefined}>Cómo pedir</Link></nav>
    <button className="cart-trigger" id="open-cart" aria-haspopup="dialog" aria-label={`Mi pedido, ${cartCount} productos`} onClick={onOpenCart}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg><span>Mi pedido</span><b id="cart-count">{cartCount}</b></button>
  </header>
  </>)
}
