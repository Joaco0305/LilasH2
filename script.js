'use strict';

// Número del negocio con código de país, sin el signo + ni espacios.
const WHATSAPP_NUMBER = '59175918018';
const STORAGE_KEY = 'lilas-cart-v1';
const SIZES = { P: 'Pequeño', M: 'Mediano', G: 'Grande', EG: 'Extra grande', U: 'Unidad' };
const BOBAS = ['Tapioca', 'Frutilla', 'Maracuyá', 'Cherry', 'Manzana', 'Mora'];
const CATEGORIES = [
  ['frozen', 'Frozzis'], ['hot', 'Calientitas'], ['boba', 'Con bobas'],
  ['iced', 'Tés & cafés fríos'], ['bakery', 'Repostería'], ['other', 'Otros']
];
// Menú reducido para la presentación: los primeros tres productos de cada categoría.
// Se conservan los identificadores originales para reconocer los carritos guardados.
// Imágenes ilustrativas generadas para este proyecto y almacenadas localmente.
const PRODUCTS = [];
function addGroup(category, group, description, entries, sizes = ['P', 'M', 'G'], canBoba = true) {
  entries.forEach(([id, name, photo, prices]) => PRODUCTS.push({
    id, name, category, group, description, photo,
    prices: Object.fromEntries(sizes.slice(0, prices.length).map((size, i) => [size, prices[i]])), canBoba
  }));
}
addGroup('frozen', 'Frozzis', 'Granizado de hielo con extracto de fruta.', [
  ['p1', 'Frozzi de mora', 'frozzi-mora', [11, 13.5, 15, 18.5]],
  ['p2', 'Frozzi de frutilla', 'frozzi-frutilla', [11, 13.5, 15, 18.5]],
  ['p3', 'Frozzi de naranja', 'frozzi-naranja', [11, 13.5, 15, 18.5]]
], ['P', 'M', 'G', 'EG']);
addGroup('hot', 'Clásicos calientes', 'Una pausa calientita para disfrutar.', [
  ['p16', 'Café regular', 'cafe-regular', [8.5, 10, 12.5]],
  ['p17', 'Té caliente', 'te-caliente', [8, 9.5, 11]],
  ['p18', 'Hot chocolate', 'hot-chocolate', [14.5, 16, 18.5]]
]);
addGroup('boba', 'Té de perlas', 'Té con leche y bobas incluidas. Frío o caliente.', [
  ['p31', 'Té de perlas · té negro', 'perlas-te-negro', [18.5, 25, 27, 40]],
  ['p32', 'Té de perlas · cherry', 'perlas-cherry', [18.5, 25, 27, 40]],
  ['p33', 'Té de perlas · coco', 'perlas-coco', [18.5, 25, 27, 40]]
], ['P', 'M', 'G', 'EG']);
addGroup('iced', 'Cafés fríos', 'Bebida fría con espresso de café.', [
  ['p37', 'Ice coffee', 'ice-coffee', [11.5, 14, 14.5, 17.5]],
  ['p38', 'Ice latte', 'ice-latte', [13.5, 15.5, 17.5, 19]],
  ['p39', 'Ice macchiato', 'ice-macchiato', [14.5, 16.5, 18.5, 20.5]]
], ['P', 'M', 'G', 'EG']);
addGroup('bakery', 'Repostería dulce', 'Algo dulce para acompañar tu bebida.', [
  ['p45', 'Queque de chocolate', 'queque-chocolate', [8]],
  ['p46', 'Queque de queso', 'queque-queso', [8]],
  ['p47', 'Queque de limón', 'queque-limon', [8]]
], ['U'], false);
addGroup('other', 'Otros', 'Para completar tu pedido.', [
  ['p50', 'Agua natural 500 ml', 'agua-natural', [5.5]],
  ['p51', 'Agua con gas 530 ml', 'agua-con-gas', [6]],
  ['p52', 'Mcnuts pequeño', 'mcnuts-pequeno', [6]]
], ['U'], false);

const $ = selector => document.querySelector(selector);
const money = amount => `Bs ${amount.toFixed(2)}`;
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const photoUrl = photo => `images/${photo}.webp`;
let category = 'frozen';
let selection = null;
let cart = loadCart();
let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter(item => {
      if (!item || typeof item !== 'object') return false;
      const product = PRODUCTS.find(p => p.id === item.id);
      return product && Object.hasOwn(product.prices, item.size) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99
        && (item.extra === '' || (product.canBoba && BOBAS.includes(item.extra)))
        && (product.category === 'boba' ? BOBAS.includes(item.included) : item.included === '')
        && (product.group === 'Smoothies' ? ['Leche', 'Agua'].includes(item.base) : item.base === '')
        && (product.group === 'Té de perlas' ? ['Frío', 'Caliente'].includes(item.temperature) : item.temperature === '');
    }).slice(0, 100);
  } catch { return []; }
}
function saveCart() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* El carrito funciona también sin almacenamiento local. */ } }
function unitPrice(item) { return PRODUCTS.find(p => p.id === item.id).prices[item.size] + (item.extra ? 5 : 0); }
function cartTotal() { return cart.reduce((total, item) => total + unitPrice(item) * item.quantity, 0); }
function details(item) {
  return [item.size === 'U' ? 'Unidad' : `${SIZES[item.size]} (${item.size})`, item.base && `Con ${item.base.toLowerCase()}`, item.temperature,
    item.included && `Bobas incluidas: ${item.included}`, item.extra && `Extra bobas: ${item.extra} (+Bs 5.00 por bebida)`].filter(Boolean).join(' · ');
}
function renderProducts() {
  const query = normalize($('#search').value.trim());
  const filtered = PRODUCTS.filter(p => p.category === category && normalize(`${p.name} ${p.group} ${p.description}`).includes(query));
  $('#category-title').textContent = CATEGORIES.find(c => c[0] === category)[1];
  $('#result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'opción' : 'opciones'}`;
  $('#no-results').hidden = filtered.length > 0;
  $('#products').innerHTML = filtered.map(p => `<article class="product-card"><div class="product-visual"><img src="${photoUrl(p.photo)}" alt="" loading="lazy"><span class="product-tag">${p.group}</span></div><div class="product-info"><h4>${p.name}</h4><p>${p.description}</p><div class="product-bottom"><div class="price"><small>${Object.keys(p.prices).length > 1 ? 'DESDE' : 'PRECIO'}</small>${money(Math.min(...Object.values(p.prices)))}</div><button class="add-product" data-product="${p.id}" aria-label="Elegir ${p.name}">Elegir <span aria-hidden="true">+</span></button></div></div></article>`).join('');
}
function openDialog(dialog) { dialog.showModal(); document.body.classList.add('modal-open'); }
function closeDialog(dialog) { dialog.close(); }
function options(values, selected) { return values.map(value => `<option${value === selected ? ' selected' : ''}>${value}</option>`).join(''); }
function openProduct(id) {
  const p = PRODUCTS.find(product => product.id === id);
  if (!p) return;
  selection = { id, size: Object.keys(p.prices)[0], quantity: 1, extra: '', included: p.category === 'boba' ? 'Tapioca' : '', base: p.group === 'Smoothies' ? 'Leche' : '', temperature: p.group === 'Té de perlas' ? 'Frío' : '' };
  $('#product-detail').innerHTML = `<div class="detail-image"><img src="${photoUrl(p.photo)}" alt=""><span class="product-tag">Fotografía ilustrativa</span></div><div class="detail-content"><p class="eyebrow">${p.group}</p><h2 id="product-name">${p.name}</h2><p class="detail-description">${p.description}</p><span class="option-label">${selection.size === 'U' ? 'Presentación' : 'Elige tu tamaño'}</span><div class="sizes" role="group" aria-label="Tamaño">${Object.entries(p.prices).map(([size, price], index) => `<button class="size-option${index === 0 ? ' active' : ''}" data-size="${size}" aria-pressed="${index === 0}" aria-label="${SIZES[size]}, ${money(price)}">${size === 'U' ? 'Unidad' : size}<span>${money(price)}</span></button>`).join('')}</div>${selection.base ? `<label class="option-label" for="drink-base">¿Con leche o agua?</label><select id="drink-base">${options(['Leche', 'Agua'], selection.base)}</select>` : ''}${selection.temperature ? `<label class="option-label" for="drink-temperature">¿Frío o caliente?</label><select id="drink-temperature">${options(['Frío', 'Caliente'], selection.temperature)}</select>` : ''}${selection.included ? `<label class="option-label" for="included-boba">Sabor de bobas incluidas</label><select id="included-boba">${options(BOBAS, selection.included)}</select>` : ''}${p.canBoba ? `<label class="option-label" for="extra-boba">¿Un extra de bobas? <span>+Bs 5.00</span></label><select id="extra-boba"><option value="">Sin extra de bobas</option>${options(BOBAS, '')}</select>` : ''}<div class="detail-bottom"><div class="quantity" aria-label="Cantidad"><button id="detail-minus" aria-label="Reducir cantidad" disabled>−</button><output id="detail-quantity" aria-live="polite">1</output><button id="detail-plus" aria-label="Aumentar cantidad">+</button></div><button class="primary" id="add-to-cart">Agregar · ${money(unitPrice(selection))}</button></div></div>`;
  openDialog($('#product-dialog'));
}
function updateSelection() {
  $('#detail-quantity').textContent = selection.quantity;
  $('#detail-minus').disabled = selection.quantity === 1;
  $('#detail-plus').disabled = selection.quantity === 99;
  $('#add-to-cart').textContent = `Agregar · ${money(unitPrice(selection) * selection.quantity)}`;
}
function addToCart() {
  const existing = cart.find(item => ['id', 'size', 'extra', 'included', 'base', 'temperature'].every(key => item[key] === selection[key]));
  if (existing && existing.quantity + selection.quantity > 99) { showToast('Puedes agregar hasta 99 unidades de esta combinación.'); return; }
  if (existing) existing.quantity += selection.quantity;
  else cart.push({ ...selection });
  saveCart(); renderCart(); closeDialog($('#product-dialog')); showToast('¡Un antojo más en tu pedido!');
}
function showToast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3000);
}
function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  $('#cart-count').textContent = count;
  $('#open-cart').setAttribute('aria-label', `Mi pedido, ${count} productos`);
  $('#cart-total').textContent = money(cartTotal());
  $('#checkout').disabled = !cart.length;
  $('#order-fields').hidden = !cart.length;
  $('#checkout-status').hidden = true;
  $('#checkout-fallback').hidden = true;
  $('#cart-items').innerHTML = cart.length ? cart.map((item, i) => {
    const p = PRODUCTS.find(product => product.id === item.id);
    return `<article class="cart-item"><div><h3>${p.name}</h3><p>${details(item)}</p><div class="quantity"><button data-action="minus" data-index="${i}" aria-label="Reducir cantidad de ${p.name}">−</button><output aria-label="Cantidad">${item.quantity}</output><button data-action="plus" data-index="${i}" aria-label="Aumentar cantidad de ${p.name}"${item.quantity >= 99 ? ' disabled' : ''}>+</button></div></div><div class="cart-item-price">${money(unitPrice(item) * item.quantity)}<button class="remove-item" data-action="remove" data-index="${i}" aria-label="Quitar ${p.name}">Quitar</button></div></article>`;
  }).join('') : '<div class="empty-state"><span aria-hidden="true">♡</span><h3>Tu próximo antojo te espera</h3><p>Agrega algo rico del menú para empezar.</p><button class="primary" id="browse-menu">Explorar el menú ↗</button></div>';
}
function buildMessage() {
  const name = $('#customer-name').value.trim();
  const notes = $('#order-notes').value.trim();
  return ['¡Hola, Lilas! 🌸 Quisiera hacer este pedido:', name ? `\nNombre: ${name}` : '', '', ...cart.map(item => {
    const p = PRODUCTS.find(product => product.id === item.id);
    return `• ${item.quantity} × ${p.name}\n  ${details(item)}\n  Precio unitario: ${money(unitPrice(item))} · Subtotal: ${money(unitPrice(item) * item.quantity)}`;
  }), '', `*Total: ${money(cartTotal())}*`, notes ? `\nNotas: ${notes}` : '', '\n¿Me confirman disponibilidad y cómo coordinar la entrega o el recojo? El total no incluye envío. ¡Gracias!'].filter(line => line !== null).join('\n');
}
function checkout() {
  if (!cart.length) return;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`;
  const fallback = $('#checkout-fallback');
  fallback.href = url; fallback.hidden = false;
  $('#checkout-status').textContent = 'Tu pedido está listo. Confirma el envío del mensaje en WhatsApp. Si no se abrió, usa el enlace de abajo.';
  $('#checkout-status').hidden = false;
  window.open(url, '_blank', 'noopener,noreferrer');
}

$('#categories').innerHTML = CATEGORIES.map(([id, label]) => `<button class="category${id === category ? ' active' : ''}" data-category="${id}" aria-pressed="${id === category}">${label}</button>`).join('');
$('#categories').addEventListener('click', event => {
  const button = event.target.closest('[data-category]'); if (!button) return;
  category = button.dataset.category;
  document.querySelectorAll('.category').forEach(tab => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-pressed', String(active)); });
  renderProducts();
});
$('#search').addEventListener('input', renderProducts);
$('#products').addEventListener('click', event => { const button = event.target.closest('[data-product]'); if (button) openProduct(button.dataset.product); });
$('#product-detail').addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button || !selection) return;
  if (button.dataset.size) {
    selection.size = button.dataset.size;
    document.querySelectorAll('.size-option').forEach(option => { const active = option === button; option.classList.toggle('active', active); option.setAttribute('aria-pressed', String(active)); });
  } else if (button.id === 'detail-minus') selection.quantity = Math.max(1, selection.quantity - 1);
  else if (button.id === 'detail-plus') selection.quantity = Math.min(99, selection.quantity + 1);
  else if (button.id === 'add-to-cart') { addToCart(); return; }
  updateSelection();
});
$('#product-detail').addEventListener('change', event => {
  const keys = { 'extra-boba': 'extra', 'included-boba': 'included', 'drink-base': 'base', 'drink-temperature': 'temperature' };
  if (keys[event.target.id]) { selection[keys[event.target.id]] = event.target.value; updateSelection(); }
});
$('#open-cart').addEventListener('click', () => { renderCart(); openDialog($('#cart-dialog')); });
$('#close-cart').addEventListener('click', () => closeDialog($('#cart-dialog')));
$('#close-product').addEventListener('click', () => closeDialog($('#product-dialog')));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open'); });
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(dialog); });
});
$('#cart-items').addEventListener('click', event => {
  if (event.target.closest('#browse-menu')) { closeDialog($('#cart-dialog')); $('#menu').scrollIntoView({ behavior: 'smooth' }); return; }
  const button = event.target.closest('[data-action]'); if (!button) return;
  const index = Number(button.dataset.index); const item = cart[index]; if (!item) return;
  if (button.dataset.action === 'remove' || (button.dataset.action === 'minus' && item.quantity === 1)) cart.splice(index, 1);
  else item.quantity = Math.min(99, Math.max(1, item.quantity + (button.dataset.action === 'plus' ? 1 : -1)));
  saveCart(); renderCart();
  const next = $(`#cart-items [data-index="${Math.min(index, cart.length - 1)}"][data-action="${button.dataset.action}"]`);
  (next || $('#close-cart')).focus();
});
$('#checkout').addEventListener('click', checkout);
['#customer-name', '#order-notes'].forEach(selector => $(selector).addEventListener('input', () => { $('#checkout-status').hidden = true; $('#checkout-fallback').hidden = true; }));
$('#year').textContent = new Date().getFullYear();
renderProducts(); renderCart();
