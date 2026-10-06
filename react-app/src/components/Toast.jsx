import { useEffect } from 'react'

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])
  return <div id="toast" className={`toast${message ? ' show' : ''}`} role="status" aria-live="polite">{message?.text}</div>
}
