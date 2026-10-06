import test from 'node:test'
import assert from 'node:assert/strict'
import { routePath, shouldNavigate } from '../src/routes.js'

const location = new URL('https://lilas.example/menu')
const event = { button: 0 }
const link = (href, options = {}) => ({ href, target: '', hasAttribute: () => false, ...options })

test('normaliza rutas y conserva URLs desconocidas para 404', () => {
  assert.equal(routePath('/menu/'), '/menu')
  assert.equal(routePath('/'), '/')
  assert.equal(routePath('/desconocida'), '/desconocida')
})

test('enlaces internos usan History; externos y especiales mantienen comportamiento nativo', () => {
  assert.ok(shouldNavigate(event, link('/historia'), location))
  assert.ok(shouldNavigate(event, link('/desconocida'), location))
  for (const href of ['https://wa.me/59175918018', 'mailto:hola@example.com', 'tel:+59175918018', '#menu', '/menu#productos', '/images/ice-latte.webp', '/api/orders', '/.netlify/functions/orders']) {
    assert.equal(shouldNavigate(event, link(href), location), false, href)
  }
  for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey', 'defaultPrevented']) assert.equal(shouldNavigate({ ...event, [modifier]: true }, link('/'), location), false)
  assert.equal(shouldNavigate({ button: 1 }, link('/'), location), false)
  assert.equal(shouldNavigate(event, link('/', { target: '_blank' }), location), false)
  assert.equal(shouldNavigate(event, link('/', { hasAttribute: name => name === 'download' }), location), false)
})
