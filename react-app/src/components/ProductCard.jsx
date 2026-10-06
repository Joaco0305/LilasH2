import { money, photoUrl } from '../utils/format.js'

export default function ProductCard({ product, onSelect }) {
  return <article className="product-card">
    <div className="product-visual"><img src={photoUrl(product.photo)} alt="" loading="lazy" /><span className="product-tag">{product.group}</span></div>
    <div className="product-info"><h4>{product.name}</h4><p>{product.description}</p>
      <div className="product-bottom"><div className="price"><small>{Object.keys(product.prices).length > 1 ? 'DESDE' : 'PRECIO'}</small>{money(Math.min(...Object.values(product.prices)))}</div>
        <button className="add-product" data-product={product.id} aria-label={`Elegir ${product.name}`} onClick={() => onSelect(product)}>Elegir <span aria-hidden="true">+</span></button>
      </div>
    </div>
  </article>
}
