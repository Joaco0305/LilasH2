import { useState } from 'react'
import { normalize } from '../utils/format.js'
import ProductCard from './ProductCard.jsx'

export default function MenuCatalog({ products, categories, onSelectProduct }) {
  const [category, setCategory] = useState('frozen')
  const [search, setSearch] = useState('')
  const query = normalize(search.trim())
  const filtered = products.filter(product => product.category === category && normalize(`${product.name} ${product.group} ${product.description}`).includes(query))
  return <section className="menu-section" id="menu" aria-labelledby="menu-title">
    <div className="menu-heading"><div><p className="eyebrow">PARA CADA MOOD, UN SABOR</p><h2 id="menu-title">¿Qué se te antoja hoy?</h2></div><p>Elige, personaliza y disfruta.<br /><span>Precios en bolivianos (Bs).</span></p></div>
    <div className="menu-toolbar"><div className="categories" id="categories" role="group" aria-label="Categorías del menú">{categories.map(([id, label]) => <button key={id} className={`category${id === category ? ' active' : ''}`} data-category={id} aria-pressed={id === category} onClick={() => setCategory(id)}>{label}</button>)}</div><label className="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg><input id="search" type="search" placeholder="Busca tu favorito" aria-label="Buscar productos" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
    <div className="results-heading"><h3 id="category-title">{categories.find(([id]) => id === category)[1]}</h3><span id="result-count">{filtered.length} {filtered.length === 1 ? 'opción' : 'opciones'}</span></div>
    <div id="products" className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />)}</div>
    <p id="no-results" className="empty-state" hidden={filtered.length > 0}>No encontramos ese antojo. Prueba con otro nombre o categoría.</p>
    <div className="boba-banner"><span className="boba-icon" aria-hidden="true">● ● ●</span><div><h3>Un extra de felicidad</h3><p>Agrega bobas a tu bebida por Bs 5.00. ¡Tú eliges el sabor!</p></div><span className="banner-flower" aria-hidden="true">✳</span></div>
  </section>
}
