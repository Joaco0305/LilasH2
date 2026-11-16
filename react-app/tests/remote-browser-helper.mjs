import { appendFile } from 'node:fs/promises'
process.loadEnvFile('.env.local')
const project = new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0]
export async function recordTestUser(page) {
  const id = await page.evaluate(key => {
    const session = JSON.parse(localStorage.getItem(key) || 'null')
    return session?.user?.id
  }, `sb-${project}-auth-token`)
  if (!/^[a-f0-9-]{36}$/.test(id || '')) throw new Error('Missing test user identity')
  await appendFile('../supabase/.temp/test-users.txt', id + '\n')
}
export async function interceptWhatsApp(page) {
  await page.evaluate(() => {
    window.open = () => ({ opener: null, close() {}, location: { replace(url) { window.orderUrl = url } } })
  })
}
