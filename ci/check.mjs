// Checks every recipe against a LearnFloo deployment: its events exist in the webhook catalog, its API endpoints
// in the OpenAPI document, its files parse. Run by GitHub Actions on each push and every night (dev deployment).
//   LEARNFLOO_API_BASE=https://…/api/v1 LEARNFLOO_API_KEY=lf_live_… node ci/check.mjs
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const base = process.env.LEARNFLOO_API_BASE ?? 'https://api.learnfloo.com/api/v1'
const key = process.env.LEARNFLOO_API_KEY
if (!key) throw new Error('LEARNFLOO_API_KEY is required (a read key of a test space)')

const catalog = await (await fetch(`${base}/webhooks/events`, { headers: { Authorization: `Bearer ${key}` } })).json()
const events = new Set((catalog.events ?? []).map((e) => e.name))
if (events.size === 0) throw new Error(`No webhook events from ${base}: ${JSON.stringify(catalog).slice(0, 200)}`)
const openapi = await (await fetch(base.replace(/\/api\/v1$/, '') + '/openapi.json')).json()
const ops = new Set()
for (const [path, methods] of Object.entries(openapi.paths ?? {})) for (const m of Object.keys(methods)) ops.add(`${m.toUpperCase()} ${path}`)

let failed = 0
const fail = (recipe, what) => {
  failed += 1
  console.error(`✗ ${recipe}: ${what}`)
}
for (const slug of readdirSync('recipes')) {
  const dir = `recipes/${slug}`
  const meta = JSON.parse(readFileSync(`${dir}/meta.json`, 'utf8'))
  for (const e of meta.events) if (!events.has(e)) fail(slug, `event ${e} is not in the webhook catalog`)
  for (const ep of meta.endpoints ?? []) {
    const [method, path] = ep.split(' ')
    const spec = `${method} ${path.replace(/:([a-zA-Z]+)/g, '{$1}')}`
    if (!ops.has(spec)) fail(slug, `endpoint ${ep} is not in the API`)
  }
  if (existsSync(`${dir}/n8n.json`)) {
    const wf = JSON.parse(readFileSync(`${dir}/n8n.json`, 'utf8'))
    for (const e of JSON.parse(readFileSync(`${dir}/n8n.src.json`, 'utf8')).events) if (!events.has(e)) fail(slug, `n8n event ${e} unknown`)
    if (!wf.nodes?.length) fail(slug, 'n8n.json has no nodes')
  }
  try {
    execFileSync(process.execPath, ['--check', `${dir}/node/index.mjs`])
  } catch {
    fail(slug, 'node/index.mjs does not parse')
  }
  if (!failed) console.log(`✓ ${slug}`)
}
if (failed) process.exit(1)
console.log(`All recipes match ${base} (${events.size} events, ${ops.size} operations).`)
