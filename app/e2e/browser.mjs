// Playwright for the e2e scripts: the app's own devDependency (app/node_modules, `npm ci`), else
// $SITE_MODULES (a node_modules folder that holds playwright and @axe-core/playwright).
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const CANDIDATES = [fileURLToPath(new URL('../node_modules/', import.meta.url)), process.env.SITE_MODULES].filter(Boolean)
export const MODULES = CANDIDATES.find((d) => existsSync(join(d, 'playwright/index.mjs')))
if (!MODULES) throw new Error(`Playwright not found in ${CANDIDATES.join(' or ')}: run npm ci in app/ (or set SITE_MODULES)`)
export const { chromium } = await import(pathToFileURL(join(MODULES, 'playwright/index.mjs')).href)
export const loadAxe = async () => (await import(pathToFileURL(join(MODULES, '@axe-core/playwright/dist/index.mjs')).href)).AxeBuilder
