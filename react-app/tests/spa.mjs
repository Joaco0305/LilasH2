import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { createRequire } from 'node:module'
import { ROUTES } from '../src/routes.js'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const dist = resolve(import.meta.dirname, '../dist')
const rules = (await readFile(resolve(dist, '_redirects'), 'utf8')).trim().split('\n').map(line => line.split(/\s+/))
for (const path of Object.keys(ROUTES).filter(path => path !== '/')) assert.ok(rules.some(([from, to, status]) => from === path && to === '/index.html' && status === '200'))
// Local check of the generated Netlify rules, not a claim of a live deployment.
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  let file = resolve(dist, '.' + (path === '/' ? '/index.html' : path))
  if (!file.startsWith(dist + sep)) { res.writeHead(403).end(); return }
  let status = 200
  try { if (!(await stat(file)).isFile()) throw Error('directory') }
  catch {
    const rule = rules.find(([from]) => from === path)
    file = resolve(dist, rule ? '.' + rule[1] : '404.html')
    status = rule ? Number(rule[2]) : 404
  }
  res.writeHead(status, { 'Content-Type': ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp' })[extname(file)] || 'application/octet-stream' })
  res.end(await readFile(file))
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const production = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) })
const report = []
try {
  for (const [environment, base] of [['development', process.env.APP_URL || 'http://127.0.0.1:5173'], ['production-rules-local', production]]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
    const errors = []
    let documents = 0
    page.on('pageerror', error => errors.push(error.message))
    page.on('request', request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++ })
    await page.goto(base)
    await page.locator('#hero-title').waitFor()
    await page.evaluate(() => { window.spaToken = 'same-document' })
    const before = documents
    await page.locator('.header a[href="/menu"]').click()
    await page.locator('#menu-title').waitFor()
    assert.equal(await page.locator('.hero').count(), 0)
    assert.equal(new URL(page.url()).pathname, '/menu')
    assert.equal(await page.locator('.header a[href="/menu"]').getAttribute('aria-current'), 'page')
    await page.locator('[data-product="p1"]').click()
    await page.locator('#add-to-cart').click()
    await page.locator('#open-cart').click()
    await page.locator('#customer-name').fill('María SPA')
    await page.locator('#customer-name').press('Enter')
    await page.locator('#order-notes').fill('Sin azúcar')
    await page.locator('#close-cart').click()
    await page.locator('.header a[href="/historia"]').click()
    await page.locator('#story-title').waitFor()
    assert.equal(await page.locator('#menu').count(), 0)
    assert.equal(await page.locator('#cart-count').innerText(), '1')
    await page.locator('#open-cart').click()
    assert.equal(await page.locator('#customer-name').inputValue(), 'María SPA')
    assert.equal(await page.locator('#order-notes').inputValue(), 'Sin azúcar')
    await page.evaluate(() => { window.open = url => { window.orderUrl = url } })
    await page.locator('#checkout').click()
    assert.ok((await page.evaluate(() => window.orderUrl)).startsWith('https://wa.me/59175918018?text='))
    await page.locator('#close-cart').click()
    await page.locator('.header a[href="/como-pedir"]').click()
    await page.locator('#como-pedir').waitFor()
    await page.goBack()
    await page.locator('#story-title').waitFor()
    await page.goBack()
    await page.locator('#menu-title').waitFor()
    await page.goForward()
    await page.locator('#story-title').waitFor()
    assert.equal(await page.evaluate(() => window.spaToken), 'same-document')
    assert.equal(documents, before, 'Internal navigation must not request another document')
    for (const [path, title] of Object.entries(ROUTES)) {
      assert.equal((await page.goto(base + path)).status(), 200)
      await page.waitForFunction(expected => document.title === expected, title)
      assert.equal((await page.reload()).status(), 200)
      await page.waitForFunction(expected => document.title === expected, title)
      assert.equal(await page.locator('#cart-count').innerText(), '1')
    }
    await page.goto(base + '/menu/?campana=clase')
    await page.locator('#menu-title').waitFor()
    const response = await page.goto(base + '/ruta-inexistente/subruta')
    if (environment === 'production-rules-local') assert.equal(response.status(), 404)
    await page.getByRole('heading', { name: 'Este camino no lleva a Lilas.' }).waitFor()
    await page.reload()
    await page.getByRole('heading', { name: 'Este camino no lleva a Lilas.' }).waitFor()
    await page.locator('.route-message a[href="/menu"]').click()
    await page.locator('#menu-title').waitFor()
    await page.goBack()
    await page.getByRole('heading', { name: 'Este camino no lleva a Lilas.' }).waitFor()
    await page.locator('.header .brand').click()
    await page.locator('#hero-title').waitFor()
    await page.goto(base + '/#historia')
    await page.locator('#story-title').waitFor()
    await page.locator('.header .brand').click()
    assert.equal(new URL(page.url()).hash, '')
    await page.setViewportSize({ width: 390, height: 844 })
    for (const route of ['menu', 'historia', 'como-pedir']) {
      await page.locator(`.header a[href="/${route}"]`).click()
      await page.locator(`#${route}`).waitFor()
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    }
    assert.deepEqual(errors, [])
    report.push({ environment, navigationWithoutReload: true, history: true, directUrlsAndReload: true, unknownRoute: true, cartAndFieldsPreserved: true, whatsapp: true, mobile: true, runtimeErrors: errors })
    await page.screenshot({ path: resolve(import.meta.dirname, `../../.docs/evidencias/spa-${environment}.png`), fullPage: true })
    await page.close()
    console.log('PASS', environment)
  }
  for (const path of ['/assets/missing.js', '/images/missing.webp', '/api/orders']) assert.equal((await fetch(production + path)).status, 404)
  assert.equal((await fetch(production + '/images/ice-latte.webp')).status, 200)
  await writeFile(resolve(import.meta.dirname, '../../.docs/evidencias/spa-results.json'), JSON.stringify({ environments: report, staticAndApi404: true, liveDeploymentVerified: false }, null, 2))
  console.log('PASS static assets and missing API are not rewritten with HTTP 200')
} finally {
  await browser.close()
  await new Promise(resolve => server.close(resolve))
}
