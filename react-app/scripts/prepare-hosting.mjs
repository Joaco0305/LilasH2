import { copyFile, writeFile } from 'node:fs/promises'
import { ROUTES } from '../src/routes.js'

// Only application routes rewrite to the SPA. Other missing URLs retain HTTP 404.
const redirects = Object.keys(ROUTES).filter(path => path !== '/')
  .flatMap(path => [`${path} /index.html 200`, `${path}/ /index.html 200`])
await writeFile(new URL('../dist/_redirects', import.meta.url), redirects.join('\n') + '\n')
await copyFile(new URL('../dist/index.html', import.meta.url), new URL('../dist/404.html', import.meta.url))
