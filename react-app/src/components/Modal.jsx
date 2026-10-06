import { useEffect, useRef } from 'react'

export default function Modal({ isOpen, onClose, labelledBy, className, id, children, dialogRef }) {
  const localRef = useRef(null)
  const ref = dialogRef ?? localRef
  useEffect(() => {
    if (!isOpen) return
    const dialog = ref.current
    const previousFocus = document.activeElement
    if (!dialog.open) dialog.showModal()
    document.body.classList.add('modal-open')
    return () => {
      dialog.close()
      document.body.classList.remove('modal-open')
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [isOpen, ref])

  return <dialog ref={ref} id={id} className={className} aria-labelledby={labelledBy}
    onCancel={event => { event.preventDefault(); onClose() }}
    onClose={() => { if (!ref.current?.open && isOpen) onClose() }}
    onClick={event => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
    }}>{children}</dialog>
}
