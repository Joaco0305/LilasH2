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
  await page.getByText('Tu próximo antojo te espera',{exact:true}).waitFor()
  assert.equal(await page.locator('#history-title').count(),0)
  assert.equal(await page.locator('.cart-item').count(),0)
  await page.locator('#close-cart').click()
 }
 await page.reload()
 await page.locator('#open-cart').click()
 await page.getByText('Tu próximo antojo te espera',{exact:true}).waitFor()
 assert.equal(await page.locator('#history-title,.history-order').count(),0)
 const count=await page.evaluate(async()=>{
  const {supabase}=await import('/src/lib/supabase.js')
  const {data,error}=await supabase.from('order_history').select('id')
  if(error)throw new Error('History verification failed')
  return data.length
 })
 assert.equal(count,2,'Requests remain stored although history is not rendered')
 await page.screenshot({path:'../.docs/evidencias/carrito-sin-historial-390.png'})
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
 assert.deepEqual(errors,[])
 console.log('PASS: two requests retained in database, no history visible before/after reload, cleared cart and mobile layout.')
}finally{await browser.close()}
