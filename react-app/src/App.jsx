import { useCallback, useEffect, useRef, useState } from 'react'
import SiteHeader from './components/SiteHeader.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import ProductDialog from './components/ProductDialog.jsx'
import CartDialog from './components/CartDialog.jsx'
import Toast from './components/Toast.jsx'
import useCart from './hooks/useCart.js'
import PageContent from './views/PageContent.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import useRoute, { navigate } from './hooks/useRoute.js'
import { ROUTES, routePath } from './routes.js'

export default function App() {
  const cart = useCart()
  const [product, setProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartSession, setCartSession] = useState(0)
  const [message, setMessage] = useState(null)
  const location = useRoute()
  const path = routePath(location.split(/[?#]/)[0])
  const mainRef = useRef(null)
  const previousPath = useRef(path)
  useEffect(() => {
    const closeDialogs = () => { setProduct(null); setCartOpen(false) }
    window.addEventListener('popstate', closeDialogs)
    return () => window.removeEventListener('popstate', closeDialogs)
  }, [])
  useEffect(() => {
    document.title = ROUTES[path] || 'Página no encontrada · Lilas'
    if (previousPath.current === path) return
    previousPath.current = path
    mainRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [path])
  const dismissToast = useCallback(() => setMessage(null), [])
  const addToCart = selection => {
    const error = cart.add(selection)
    setMessage({ text: error || '¡Un antojo más en tu pedido!' })
    if (!error) setProduct(null)
  }
  return <>
    <SiteHeader path={path} cartCount={cart.count} onOpenCart={() => { setCartSession(value => value + 1); setCartOpen(true) }} />
    <main ref={mainRef} tabIndex={-1} className={path === '/' ? undefined : 'route-view'}><ErrorBoundary key={path}><PageContent path={path} onSelectProduct={setProduct} /></ErrorBoundary></main>
    <SiteFooter />
    {product && <ProductDialog key={product.id} product={product} onClose={() => setProduct(null)} onAdd={addToCart} />}
    <CartDialog isOpen={cartOpen} session={cartSession} items={cart.items} total={cart.total} onClose={() => setCartOpen(false)} onChangeQuantity={cart.updateQuantity} onRemove={cart.remove} onBrowseMenu={() => { setCartOpen(false); navigate('/menu') }} />
    <Toast message={message} onDismiss={dismissToast} />
  </>
}
