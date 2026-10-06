import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { createRequire } from 'node:module'
import { PRODUCTS, CATEGORIES, BOBAS } from '../src/data/menu.js'
import { initialSelection } from '../src/utils/cart.js'

// Uses an existing Playwright installation; does not add project dependencies.
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.env.APP_URL || 'http://localhost:5173'
const legacyRoot = resolve(import.meta.dirname, '../../.docs/Legacy')
const evidence = resolve(import.meta.dirname, '../../.docs/evidencias')
await mkdir(evidence, { recursive: true })
const server = createServer(async (req, res) => {
  const file = resolve(legacyRoot, '.' + (new URL(req.url, 'http://localhost').pathname === '/' ? '/index.html' : decodeURIComponent(new URL(req.url, 'http://localhost').pathname)))
  if (!file.startsWith(legacyRoot + sep)) { res.writeHead(403).end(); return }
  try {
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp' })[extname(file)] || 'application/octet-stream')
    res.end(await readFile(file))
  } catch { res.writeHead(404).end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const legacyUrl = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) })
const errors = []
const report = { functional: [], visual: [], externalResourceFailures: [] }
const check = (name, condition = true) => { assert.ok(condition, name); report.functional.push(name); console.log('PASS', name) }
async function pageFor(width = 1440) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => {
    if (request.url().startsWith('http://localhost') || request.url().startsWith('http://127.0.0.1')) errors.push(request.url() + ' ' + request.failure()?.errorText)
    else report.externalResourceFailures.push(request.url() + ' ' + request.failure()?.errorText)
  })
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base) && !response.url().endsWith('/favicon.ico')) errors.push(`${response.status()} ${response.url()}`) })
  return page
}
async function ready(page, url) {
  const response = await page.goto(url)
  assert.equal(response.status(), 200)
  await page.locator('.product-card').first().waitFor()
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}) }))
  })
}
const visible = (page, selector) => page.locator(selector).isVisible()
try {
  const page = await pageFor()
  await ready(page, base)
  check('React renderiza Lilas con tres Frozzis iniciales', await page.locator('#root .product-card').count() === 3)
  for (const [category, label] of CATEGORIES) {
    await page.locator(`[data-category="${category}"]`).click()
    assert.equal(await page.locator('#category-title').innerText(), label)
    assert.equal(await page.locator(`[data-category="${category}"]`).getAttribute('aria-pressed'), 'true')
    assert.deepEqual(await page.locator('.product-card h4').allTextContents(), PRODUCTS.filter(p => p.category === category).map(p => p.name))
    for (const product of PRODUCTS.filter(p => p.category === category)) {
      await page.locator(`[data-product="${product.id}"]`).click()
      await page.locator('#product-dialog[open]').waitFor()
      assert.equal(await page.locator('#product-name').innerText(), product.name)
      assert.equal(await page.locator('#extra-boba').count(), product.canBoba ? 1 : 0)
      for (const [size, price] of Object.entries(product.prices)) {
        await page.locator(`[data-size="${size}"]`).click()
        assert.equal(await page.locator('#add-to-cart').innerText(), `Agregar · Bs ${price.toFixed(2)}`)
      }
      assert.ok(await page.locator('.detail-image img').evaluate(img => img.complete && img.naturalWidth > 0))
      await page.keyboard.press('Escape')
      await page.locator('#product-dialog').waitFor({ state: 'detached' })
    }
  }
  check('18 productos, seis categorías, todos los tamaños/precios e imágenes')
  await page.locator('[data-category="bakery"]').click()
  await page.locator('#search').fill('LIMON')
  assert.equal(await page.locator('.product-card h4').innerText(), 'Queque de limón')
  await page.locator('[data-category="hot"]').click()
  assert.equal(await page.locator('#search').inputValue(), 'LIMON')
  assert.ok(await visible(page, '#no-results'))
  await page.locator('#search').fill('')
  check('Búsqueda sin acentos, persistencia entre categorías y recuperación del estado vacío')
  await page.locator('#open-cart').click()
  assert.ok(await page.locator('#checkout').isDisabled())
  assert.ok(!await visible(page, '#order-fields'))
  await page.locator('#browse-menu').click()
  assert.ok(!await visible(page, '#cart-dialog'))
  check('Carrito vacío y regreso al menú')
  await page.locator('[data-category="frozen"]').click()
  await page.locator('[data-product="p1"]').click()
  assert.ok(await page.locator('#detail-minus').isDisabled())
  await page.locator('[data-size="G"]').click()
  for (const extra of BOBAS) {
    await page.locator('#extra-boba').selectOption(extra)
    assert.equal(await page.locator('#add-to-cart').innerText(), 'Agregar · Bs 20.00')
  }
  await page.locator('#detail-plus').click()
  assert.equal(await page.locator('#add-to-cart').innerText(), 'Agregar · Bs 40.00')
  await page.locator('#add-to-cart').click()
  await page.locator('[data-category="bakery"]').click()
  await page.locator('[data-product="p45"]').click()
  await page.locator('#add-to-cart').click()
  await page.locator('#open-cart').click()
  assert.equal(await page.locator('#cart-total').innerText(), 'Bs 48.00')
  assert.equal(await page.locator('#cart-count').innerText(), '3')
  await page.locator('#customer-name').fill('María & José')
  await page.locator('#order-notes').fill('Sin azúcar 🍵')
  assert.equal(await page.locator('#customer-name').getAttribute('maxlength'), '80')
  assert.equal(await page.locator('#order-notes').getAttribute('maxlength'), '500')
  await page.evaluate(() => { window.open = (...args) => { window.openedOrder = args; return null } })
  await page.locator('#checkout').click()
  const [url, target, features] = await page.evaluate(() => window.openedOrder)
  assert.equal(new URL(url).pathname, '/59175918018')
  assert.equal(target, '_blank')
  assert.equal(features, 'noopener,noreferrer')
  const message = new URL(url).searchParams.get('text')
  for (const text of ['2 × Frozzi de mora', 'Grande (G)', 'Extra bobas: Mora', '1 × Queque de chocolate', '*Total: Bs 48.00*', 'María & José', 'Sin azúcar 🍵']) assert.ok(message.includes(text), text)
  assert.equal(await page.locator('#checkout-fallback').getAttribute('href'), url)
  assert.ok(await visible(page, '#checkout-status'))
  assert.equal(await page.locator('.cart-item').count(), 2)
  await page.locator('#order-notes').fill('Otra nota')
  assert.ok(!await visible(page, '#checkout-fallback'))
  await page.locator('#close-cart').click()
  await page.locator('#open-cart').click()
  assert.equal(await page.locator('#customer-name').inputValue(), 'María & José')
  assert.equal(await page.locator('#order-notes').inputValue(), 'Otra nota')
  check('Pedido Bs 48, nombre/notas, mensaje WhatsApp y alternativa sin enviar mensajes reales')
  await page.reload()
  await page.locator('#open-cart').click()
  assert.equal(await page.locator('#cart-total').innerText(), 'Bs 48.00')
  await page.getByRole('button', { name: 'Aumentar cantidad de Frozzi de mora', exact: true }).click()
  assert.equal(await page.locator('#cart-total').innerText(), 'Bs 68.00')
  await page.getByRole('button', { name: 'Reducir cantidad de Frozzi de mora', exact: true }).click()
  await page.getByRole('button', { name: 'Quitar Frozzi de mora', exact: true }).click()
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Quitar Queque de chocolate')
  await page.getByRole('button', { name: 'Reducir cantidad de Queque de chocolate', exact: true }).click()
  assert.ok(await page.locator('#checkout').isDisabled())
  assert.equal(await page.evaluate(() => document.activeElement.id), 'close-cart')
  await page.keyboard.press('Escape')
  assert.equal(await page.evaluate(() => document.activeElement.id), 'open-cart')
  assert.ok(!await page.locator('body').evaluate(el => el.classList.contains('modal-open')))
  check('Persistencia, cantidades, eliminación y devolución del foco')
  await page.locator('[data-category="boba"]').click()
  await page.locator('[data-product="p31"]').click()
  await page.locator('#drink-temperature').selectOption('Caliente')
  await page.locator('#included-boba').selectOption('Cherry')
  assert.equal(await page.locator('#add-to-cart').innerText(), 'Agregar · Bs 18.50')
  await page.locator('#extra-boba').selectOption('Mora')
  assert.equal(await page.locator('#add-to-cart').innerText(), 'Agregar · Bs 23.50')
  await page.locator('#add-to-cart').click()
  await page.locator('[data-product="p31"]').click()
  await page.locator('#add-to-cart').click()
  await page.locator('[data-product="p31"]').click()
  await page.locator('#add-to-cart').click()
  await page.locator('#open-cart').click()
  assert.equal(await page.locator('.cart-item').count(), 2)
  assert.equal(await page.locator('#cart-total').innerText(), 'Bs 60.50')
  await page.locator('#cart-title').click()
  assert.ok(await visible(page, '#cart-dialog'))
  for (let i = 0; i < 18; i++) { await page.keyboard.press('Tab'); assert.ok(await page.evaluate(() => document.activeElement === document.body || document.activeElement.closest('dialog')?.id === 'cart-dialog')) }
  await page.mouse.click(5, 450)
  assert.ok(!await visible(page, '#cart-dialog'))
  await page.locator('[data-product="p31"]').click()
  await page.mouse.click(5, 450)
  assert.ok(!await visible(page, '#product-dialog'))
  check('Bobas incluidas, extras, temperatura, combinación de líneas, teclado y clic exterior')
  const limitItem = { ...initialSelection(PRODUCTS[0]), quantity: 99 }
  await page.evaluate(item => localStorage.setItem('lilas-cart-v1', JSON.stringify([item])), limitItem)
  await page.reload()
  await page.locator('[data-product="p1"]').click()
  await page.locator('#add-to-cart').click()
  assert.ok(await visible(page, '#product-dialog'))
  assert.ok((await page.locator('#toast').innerText()).includes('99 unidades'))
  for (let i = 1; i < 99; i++) await page.locator('#detail-plus').click()
  assert.ok(await page.locator('#detail-plus').isDisabled())
  await page.keyboard.press('Escape')
  await page.locator('#open-cart').click()
  assert.ok(await page.getByRole('button', { name: 'Aumentar cantidad de Frozzi de mora', exact: true }).isDisabled())
  await page.keyboard.press('Escape')
  await page.locator('#toast.show').waitFor({ state: 'hidden', timeout: 6000 })
  check('Límite de 99, aviso temporal y controles deshabilitados')
  await page.evaluate(() => localStorage.setItem('lilas-cart-v1', '{broken'))
  await page.reload()
  assert.equal(await page.locator('#cart-count').innerText(), '0')
  const blocked = await pageFor()
  await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError') } }) })
  await ready(blocked, base)
  await blocked.locator('[data-product="p1"]').click()
  await blocked.locator('#add-to-cart').click()
  assert.equal(await blocked.locator('#cart-count').innerText(), '1')
  await blocked.close()
  check('JSON corrupto y localStorage bloqueado no interrumpen la aplicación')
  for (const anchor of ['menu', 'historia', 'como-pedir']) {
    await page.locator(`.header a[href="/${anchor}"]`).click()
    await page.waitForFunction(id => location.pathname === '/' + id, anchor)
    const bounds = await page.locator('#open-cart').boundingBox()
    assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= 900)
  }
  await page.locator('.header .brand').click()
  check('Rutas de secciones y carrito visible al desplazarse')
  await page.close()

  for (const width of [359, 360, 361, 390, 519, 520, 521, 759, 760, 761, 768, 1024, 1099, 1100, 1101, 1440, 1500]) {
    const legacy = await pageFor(width)
    const react = await pageFor(width)
    await Promise.all([ready(legacy, legacyUrl), ready(react, base)])
    const layout = page => page.evaluate(() => {
      const selectors = ['.announcement', '.header', '.hero', '.hero-copy', '.hero-photo', '.flavor-strip', '#menu', '.menu-toolbar', '.product-grid', '.product-card', '.boba-banner', '#como-pedir', '#historia', 'footer']
      return Object.fromEntries(selectors.map(selector => {
        const node = document.querySelector(selector), rect = node.getBoundingClientRect(), style = getComputedStyle(node)
        return [selector, { x: rect.x, y: rect.y, width: rect.width, height: rect.height, font: style.fontFamily, color: style.color, background: style.backgroundColor }]
      }))
    })
    assert.deepEqual(await layout(react), await layout(legacy), `layout ${width}`)
    const overflow = await react.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    assert.equal(overflow, await legacy.evaluate(() => document.documentElement.scrollWidth - innerWidth), `overflow parity ${width}`)
    assert.ok(overflow <= 1, `overflow ${width}`)
    const capture = [360, 390, 768, 1024, 1440].includes(width)
    if (capture) {
      await legacy.screenshot({ path: `${evidence}/legacy-${width}.png`, fullPage: true })
      await react.screenshot({ path: `${evidence}/react-${width}.png`, fullPage: true })
    }
    for (const kind of ['product', 'cart']) {
      for (const p of [legacy, react]) {
        await p.locator('[data-product="p1"]').click()
        if (kind === 'cart') { await p.locator('#add-to-cart').click(); await p.locator('#open-cart').click() }
        await p.locator(`#${kind}-dialog[open]`).waitFor()
      }
      const geometry = p => p.locator(`#${kind}-dialog`).evaluate(node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, scroll: node.scrollWidth } })
      assert.deepEqual(await geometry(react), await geometry(legacy), `${kind} layout ${width}`)
      if (capture) {
        await legacy.screenshot({ path: `${evidence}/legacy-${kind}-${width}.png` })
        await react.screenshot({ path: `${evidence}/react-${kind}-${width}.png` })
      }
      await legacy.keyboard.press('Escape'); await react.keyboard.press('Escape')
    }
    report.visual.push({ width, layout: 'identical', dialogs: 'identical', overflowPixels: overflow })
    console.log('PASS visual', width)
    await legacy.close(); await react.close()
  }
  assert.deepEqual(errors, [])
  report.runtimeErrors = errors
  report.externalResourceFailures = [...new Set(report.externalResourceFailures)]
  await writeFile(`${evidence}/browser-results.json`, JSON.stringify(report, null, 2))
  console.log('ALL PASSED')
} finally {
  await browser.close()
  await new Promise(resolve => server.close(resolve))
}
