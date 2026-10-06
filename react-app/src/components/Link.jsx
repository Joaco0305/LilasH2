import { navigate } from '../hooks/useRoute.js'
import { shouldNavigate } from '../routes.js'

export default function Link({ href, onClick, children, ...props }) {
  return <a {...props} href={href} onClick={event => {
    onClick?.(event)
    if (!shouldNavigate(event, event.currentTarget, window.location)) return
    event.preventDefault()
    const url = new URL(event.currentTarget.href)
    navigate(url.pathname + url.search)
  }}>{children}</a>
}
