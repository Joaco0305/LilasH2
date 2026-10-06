export const ROUTES = {
  '/': 'Lilas · Un antojo, mil formas de disfrutar',
  '/menu': 'Nuestro menú · Lilas',
  '/historia': 'Nuestra historia · Lilas',
  '/como-pedir': 'Cómo pedir · Lilas',
}

export const routePath = pathname => pathname.replace(/\/+$/, '') || '/'

export function shouldNavigate(event, link, location) {
  const url = new URL(link.href, location.href)
  return !event.defaultPrevented && event.button === 0
    && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
    && (!link.target || link.target === '_self') && !link.hasAttribute('download')
    && url.origin === location.origin && ['http:', 'https:'].includes(url.protocol)
    && !url.hash && !/\.[^/]+$/.test(url.pathname)
    && !/^\/(api|\.netlify)(\/|$)/.test(url.pathname)
}
