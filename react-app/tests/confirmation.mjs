import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { recordTestUser, interceptWhatsApp } from './remote-browser-helper.mjs'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({headless:true, ...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE} : {})})
try {
 for (const width of [360,390,1440]) {
  const page = await browser.newPage({viewport:{width,height:width<500?740:900},reducedMotion:'reduce'})
  await page.goto((process.env.APP_URL || 'http://127.0.0.1:5173') + '/menu')
  await page.locator('[data-product="p1"]').click()
  await page.locator('[data-size="G"]').click()
  await page.locator('#extra-boba').selectOption('Mora')
  await page.locator('#detail-plus').click()
  await page.locator('#add-to-cart').click()
  await page.locator('#product-dialog').waitFor({state:'detached'})
  await recordTestUser(page)
  await page.locator('#open-cart').click()
  assert.equal(await page.locator('#cart-total').innerText(),'Bs 40.00')
  assert.ok(await page.locator('#order-confirmation-notice').isVisible())
  const button=await page.locator('#checkout').boundingBox()
  assert.ok(button && button.y>=0 && button.y+button.height<=page.viewportSize().height)
  await interceptWhatsApp(page)
  await page.locator('#checkout').click()
  await page.waitForFunction(()=>window.orderUrl?.startsWith('https://wa.me/'))
  const message=new URL(await page.evaluate(()=>window.orderUrl)).searchParams.get('text')
  assert.ok(message.includes('*Total estimado: Bs 40.00*'))
  assert.ok(message.includes('El precio y la disponibilidad se confirman con la cafetería antes de aceptar el pedido.'))
  await page.screenshot({path:fileURLToPath(new URL(`../../.docs/evidencias/confirmacion-pedido-${width}.png`,import.meta.url))})
  await page.close()
  console.log('PASS confirmation and estimated Bs 40 at width',width)
 }
} finally { await browser.close() }
