import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <section className="route-message" role="alert">
      <p className="eyebrow">ALGO NO SALIÓ BIEN</p>
      <h1>No pudimos mostrar esta página.</h1>
      <p>Intenta cargarla de nuevo. Tu pedido guardado seguirá en este navegador.</p>
      <button className="primary" onClick={() => window.location.reload()}>Volver a cargar</button>
    </section>
    return this.props.children
  }
}
