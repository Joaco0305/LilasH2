export const SIZES = { P: 'Pequeño', M: 'Mediano', G: 'Grande', EG: 'Extra grande', U: 'Unidad' }
export const BOBAS = ['Tapioca', 'Frutilla', 'Maracuyá', 'Cherry', 'Manzana', 'Mora']
export const CATEGORIES = [
  ['frozen', 'Frozzis'], ['hot', 'Calientitas'], ['boba', 'Con bobas'],
  ['iced', 'Tés & cafés fríos'], ['bakery', 'Repostería'], ['other', 'Otros']
]
export const PRODUCTS = []
function addGroup(category, group, description, entries, sizes = ['P', 'M', 'G'], canBoba = true) {
  entries.forEach(([id, name, photo, prices]) => PRODUCTS.push({
    id, name, category, group, description, photo,
    prices: Object.fromEntries(sizes.slice(0, prices.length).map((size, i) => [size, prices[i]])), canBoba
  }))
}
addGroup('frozen', 'Frozzis', 'Granizado de hielo con extracto de fruta.', [
  ['p1', 'Frozzi de mora', 'frozzi-mora', [11, 13.5, 15, 18.5]],
  ['p2', 'Frozzi de frutilla', 'frozzi-frutilla', [11, 13.5, 15, 18.5]],
  ['p3', 'Frozzi de naranja', 'frozzi-naranja', [11, 13.5, 15, 18.5]]
], ['P', 'M', 'G', 'EG'])
addGroup('hot', 'Clásicos calientes', 'Una pausa calientita para disfrutar.', [
  ['p16', 'Café regular', 'cafe-regular', [8.5, 10, 12.5]],
  ['p17', 'Té caliente', 'te-caliente', [8, 9.5, 11]],
  ['p18', 'Hot chocolate', 'hot-chocolate', [14.5, 16, 18.5]]
])
addGroup('boba', 'Té de perlas', 'Té con leche y bobas incluidas. Frío o caliente.', [
  ['p31', 'Té de perlas · té negro', 'perlas-te-negro', [18.5, 25, 27, 40]],
  ['p32', 'Té de perlas · cherry', 'perlas-cherry', [18.5, 25, 27, 40]],
  ['p33', 'Té de perlas · coco', 'perlas-coco', [18.5, 25, 27, 40]]
], ['P', 'M', 'G', 'EG'])
addGroup('iced', 'Cafés fríos', 'Bebida fría con espresso de café.', [
  ['p37', 'Ice coffee', 'ice-coffee', [11.5, 14, 14.5, 17.5]],
  ['p38', 'Ice latte', 'ice-latte', [13.5, 15.5, 17.5, 19]],
  ['p39', 'Ice macchiato', 'ice-macchiato', [14.5, 16.5, 18.5, 20.5]]
], ['P', 'M', 'G', 'EG'])
addGroup('bakery', 'Repostería dulce', 'Algo dulce para acompañar tu bebida.', [
  ['p45', 'Queque de chocolate', 'queque-chocolate', [8]],
  ['p46', 'Queque de queso', 'queque-queso', [8]],
  ['p47', 'Queque de limón', 'queque-limon', [8]]
], ['U'], false)
addGroup('other', 'Otros', 'Para completar tu pedido.', [
  ['p50', 'Agua natural 500 ml', 'agua-natural', [5.5]],
  ['p51', 'Agua con gas 530 ml', 'agua-con-gas', [6]],
  ['p52', 'Mcnuts pequeño', 'mcnuts-pequeno', [6]]
], ['U'], false)

