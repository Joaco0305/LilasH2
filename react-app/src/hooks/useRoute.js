import { useSyncExternalStore } from 'react'

const subscribe = callback => {
  window.addEventListener('popstate', callback)
  window.addEventListener('hashchange', callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener('hashchange', callback)
  }
}
const snapshot = () => window.location.pathname + window.location.search + window.location.hash

export function navigate(to) {
  window.scrollTo({ top: 0, behavior: 'instant' })
  if (snapshot() === to) return
  window.history.pushState(null, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function useRoute() {
  return useSyncExternalStore(subscribe, snapshot)
}
