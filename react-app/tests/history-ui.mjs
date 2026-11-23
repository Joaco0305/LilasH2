import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { recordTestUser, interceptWhatsApp } from './remote-browser-helper.mjs'
const require=createRequire(import.meta.url)
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE})
const base=process.env.APP_URL || 'http://127.0.0.1:5173'
try {
 const page=await browser.newPage({viewport:{width:390,height:844}})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto(base+'/menu')
 for(let i=0;i<2;i++){
  await page.locator('[data-product="p1"]').click()
  await page.locator('#add-to-cart').click()
  await page.locator('#product-dialog').waitFor({state:'detached'})
  if(i===0)await recordTestUser(page)
  await page.locator('#open-cart').click()
  await page.locator('#customer-name').fill('Prueba historial')
  await interceptWhatsApp(page)
  await page.locator('#checkout').click()
  await page.waitForFunction(()=>window.orderUrl?.startsWith('https://wa.me/'))
  await page.waitForFunction(n=>document.querySelectorAll('.history-order').length===n,i+1)
  assert.equal(await page.locator('.cart-item').count(),0)
  await page.locator('#close-cart').click()
 }
 await page.reload()
 await page.locator('#open-cart').click()
 await page.waitForFunction(()=>document.querySelectorAll('.history-order').length===2)
 await page.locator('.history-order summary').first().click()
 assert.ok((await page.locator('.history-order').first().innerText()).includes('Frozzi de mora'))
 assert.ok((await page.locator('.history-order').first().innerText()).includes('Preparada'))
 assert.ok((await page.locator('.history-order a').first().getAttribute('href')).includes('wa.me/'))
 await page.locator('.history-order').first().scrollIntoViewIfNeeded()
 await page.screenshot({path:'../.docs/evidencias/historial-390.png'})
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
 assert.deepEqual(errors,[])
 console.log('PASS UI history: two successive orders, cleared cart, reload persistence, detail, WhatsApp reopening and mobile layout.')
}finally{await browser.close()}
