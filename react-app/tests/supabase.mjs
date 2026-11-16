// Integration test against the configured REAL project. Never uses service_role.
import assert from 'node:assert/strict'
import { appendFile, mkdir } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
process.loadEnvFile('.env.local')
const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const a = client(), b = client(), publicClient = client()
const ok = result => { assert.equal(result.error, null, result.error?.message); return result.data }
await mkdir('../supabase/.temp', { recursive: true })
for (const user of [a, b]) {
  const session = ok(await user.auth.signInAnonymously())
  await appendFile('../supabase/.temp/test-users.txt', session.user.id + '\n')
}
const userA = ok(await a.auth.getUser()).user.id
const userB = ok(await b.auth.getUser()).user.id
const change = async (who, action, payload) => ok(await who.rpc('change_cart', { action, payload }))
const read = async who => ok(await who.rpc('get_cart'))
const selection = { id:'p1', size:'G', quantity:2, extra:'Tapioca', included:'', base:'', temperature:'' }
assert.equal(ok(await publicClient.from('products').select('id')).length,18)
assert.ok((await publicClient.from('orders').select('*')).error)
assert.ok((await publicClient.rpc('get_cart')).error)
let cart = await change(a,'add', { ...selection, unitPrice:0.01, total:0.02 })
assert.equal(cart.total,40)
assert.equal(cart.items[0].unitPrice,20)
assert.deepEqual(await read(a),cart)
const orderId = cart.id, line = cart.items[0].lineId
assert.equal((await read(b)).items.length,0)
assert.deepEqual(ok(await b.from('orders').select('*').eq('id',orderId)),[])
assert.deepEqual(ok(await b.from('order_items').select('*').eq('id',line)),[])
assert.deepEqual(ok(await b.from('order_items').update({quantity:1}).eq('id',line).select()),[])
assert.deepEqual(ok(await b.from('order_items').delete().eq('id',line).select()),[])
assert.ok((await b.from('order_items').insert({order_id:orderId,product_id:'p45',size:'U',quantity:1})).error)
assert.ok((await a.from('orders').update({owner_id:userB}).eq('id',orderId)).error)
assert.ok((await b.from('orders').insert({owner_id:userA})).error)
assert.ok((await a.from('product_prices').update({price:0.01}).eq('product_id','p1')).error)
await change(b,'metadata',{name:'Visitante B ficticio',notes:''})
const otherOrder = (await read(b)).id
assert.ok((await a.from('order_items').update({order_id:otherOrder}).eq('id',line)).error)
assert.ok((await b.rpc('change_cart',{action:'remove',payload:{lineId:line}})).error)
assert.equal((await read(a)).total,40)
for (const quantity of [0,100,-1,1.5]) {
  assert.ok((await a.rpc('change_cart',{action:'quantity',payload:{lineId:line,quantity}})).error)
}
for (const invalid of [{size:'U'},{extra:'Invalid'},{included:'Mora'},{base:'Leche'},{id:'missing'}]) {
  assert.ok((await a.rpc('change_cart',{action:'add',payload:{...selection,...invalid}})).error)
}
assert.ok((await a.from('order_items').update({extra:'Invalid'}).eq('id',line)).error)
assert.ok((await a.rpc('change_cart',{action:'metadata',payload:{name:'X'.repeat(81)}})).error)
assert.ok((await a.rpc('change_cart',{action:'metadata',payload:{notes:'X'.repeat(501)}})).error)
cart = await change(a,'metadata',{name:'Cliente ficticio',notes:'Nota ficticia'})
assert.equal((await read(a)).name,'Cliente ficticio')
cart = await change(a,'metadata',{name:'Actualizado',notes:'Otra nota'})
assert.equal((await read(a)).notes,'Otra nota')
cart = await change(a,'metadata',{name:'',notes:''})
assert.equal((await read(a)).name,'')
assert.equal((await read(a)).notes,'')
cart = await change(a,'quantity',{lineId:line,quantity:3})
assert.equal((await read(a)).total,60)
cart = await change(a,'add',{id:'p45',size:'U',quantity:1})
assert.equal((await read(a)).total,68)
cart = await change(a,'remove',{lineId:line})
assert.equal((await read(a)).total,8)
assert.ok((await a.rpc('change_cart',{action:'remove',payload:{lineId:line}})).error)
const boba = await change(a,'add',{id:'p31',size:'P',quantity:1,included:'Mora',temperature:'Caliente'})
assert.equal(boba.total,26.5)
// Concurrent additions merge atomically rather than overwriting each other.
await Promise.all([change(a,'add',{id:'p45',size:'U',quantity:1}),change(a,'add',{id:'p45',size:'U',quantity:1})])
assert.equal((await read(a)).items.find(i=>i.id==='p45').quantity,3)
const cake = (await read(a)).items.find(i=>i.id==='p45')
await change(a,'quantity',{lineId:cake.lineId,quantity:99})
assert.ok((await a.rpc('change_cart',{action:'add',payload:{id:'p45',size:'U',quantity:1}})).error)
assert.equal((await read(a)).items.find(i=>i.id==='p45').quantity,99)
for (const who of [a,b]) {
  const current = await read(who)
  const removed = ok(await who.from('orders').delete().eq('id',current.id).select('id'))
  assert.equal(removed.length,1)
  assert.equal((await read(who)).items.length,0)
  assert.deepEqual(ok(await who.from('order_items').select('id')),[])
}
console.log('PASS: real CRUD, authoritative prices, invalid inputs, atomic merge, two-user RLS, anonymous-role denial and cascade deletion.')
