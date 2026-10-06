import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { PRODUCTS, CATEGORIES, BOBAS } from '../src/data/menu.js'
import { normalize } from '../src/utils/format.js'
import { addItem, buildMessage, cartTotal, changeQuantity, initialSelection, itemKey, persistCart, readCart, unitPrice, validItem, whatsappUrl } from '../src/utils/cart.js'

const frozzi = { ...initialSelection(PRODUCTS[0]), size: 'G', extra: 'Mora', quantity: 2 }
const cake = initialSelection(PRODUCTS.find(product => product.id === 'p45'))

test('catálogo, categorías y precios coinciden con la fuente Legacy', () => {
  const source = readFileSync(new URL('../../.docs/Legacy/script.js', import.meta.url), 'utf8')
  const context = vm.createContext({})
  vm.runInContext(source.slice(0, source.indexOf('const $ =')) + '\nglobalThis.data = { PRODUCTS, CATEGORIES, BOBAS }', context)
  assert.deepEqual(JSON.parse(JSON.stringify(context.data)), { PRODUCTS, CATEGORIES, BOBAS })
  assert.equal(PRODUCTS.length, 18)
  for (const [category] of CATEGORIES) assert.equal(PRODUCTS.filter(product => product.category === category).length, 3)
  assert.equal(normalize('TÉ de LIMÓN'), 'te de limon')
})

test('precios y extras por unidad: dos frozzis G y un queque = Bs 48', () => {
  assert.equal(unitPrice(frozzi), 20)
  assert.equal(cartTotal([frozzi]), 40)
  assert.equal(cartTotal([frozzi, cake]), 48)
  for (const extra of BOBAS) assert.equal(unitPrice({ ...frozzi, extra }), 20)
})

test('combinaciones iguales se fusionan, variantes se separan y se limita a 99', () => {
  const original = [frozzi]
  const merged = addItem(original, frozzi)
  assert.equal(merged.items.length, 1)
  assert.equal(merged.items[0].quantity, 4)
  assert.equal(original[0].quantity, 2)
  assert.equal(addItem(original, { ...frozzi, size: 'P' }).items.length, 2)
  assert.equal(addItem(original, { ...frozzi, extra: 'Cherry' }).items.length, 2)
  assert.ok(addItem([{ ...frozzi, quantity: 99 }], frozzi).error)
  assert.equal(changeQuantity(original, itemKey(frozzi), 120)[0].quantity, 99)
  assert.deepEqual(changeQuantity(original, itemKey(frozzi), 0), [])
})

test('valida tamaños, sabores, temperaturas, unidades y almacenamiento dañado', () => {
  for (const product of PRODUCTS) assert.ok(validItem(initialSelection(product)))
  for (const item of [null, {}, { ...frozzi, id: 'no-existe' }, { ...frozzi, size: 'XL' }, { ...frozzi, quantity: 0 }, { ...frozzi, quantity: 1.5 }, { ...frozzi, quantity: 100 }, { ...frozzi, extra: 'inválido' }, { ...cake, extra: 'Mora' }]) assert.equal(validItem(item), false)
  const tea = initialSelection(PRODUCTS.find(product => product.category === 'boba'))
  assert.equal(unitPrice(tea), 18.5)
  assert.ok(validItem({ ...tea, included: 'Mora', temperature: 'Caliente' }))
  assert.equal(validItem({ ...tea, included: '' }), false)
  assert.equal(validItem({ ...tea, temperature: 'Tibio' }), false)
  assert.equal(addItem([tea], { ...tea, temperature: 'Caliente' }).items.length, 2)
  assert.deepEqual(readCart({ getItem: () => '{error' }), [])
  assert.deepEqual(readCart({ getItem: () => '{}' }), [])
  assert.deepEqual(readCart({ getItem: () => JSON.stringify([frozzi, null, { ...cake, size: 'G' }]) }), [frozzi])
  assert.equal(readCart({ getItem: () => JSON.stringify(Array(101).fill(cake)) }).length, 100)
  const unavailable = { getItem() { throw new Error('Blocked') }, setItem() { throw new Error('Blocked') } }
  assert.deepEqual(readCart(unavailable), [])
  assert.doesNotThrow(() => persistCart([frozzi], unavailable))
})

test('WhatsApp conserva literalmente el mensaje Legacy y codifica caracteres especiales', () => {
  const source = readFileSync(new URL('../../.docs/Legacy/script.js', import.meta.url), 'utf8')
  const context = vm.createContext({ localStorage: { getItem: () => '[]' }, document: { querySelector: selector => ({ value: selector === '#customer-name' ? '  María & José  ' : '  Sin azúcar 🍵  ' }) } })
  vm.runInContext(source.slice(0, source.indexOf("$('#categories').innerHTML")) + '\nglobalThis.compare = value => { cart = value; return buildMessage() }', context)
  const message = buildMessage([frozzi, cake], '  María & José  ', '  Sin azúcar 🍵  ')
  assert.equal(message, context.compare([frozzi, cake]))
  const url = new URL(whatsappUrl([frozzi, cake], '  María & José  ', '  Sin azúcar 🍵  '))
  assert.equal(url.pathname, '/59175918018')
  assert.equal(url.searchParams.get('text'), message)
  assert.ok(message.includes('*Total: Bs 48.00*'))
})
