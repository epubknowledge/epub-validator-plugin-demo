import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, expectTypeOf, it } from 'vitest'

import plugin, { type CheckId } from '@/plugin'

// The validator refuses a plugin whose src/plugin.ts doesn't export exactly
// one function per check in plugin.json, so this catches it first.

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
)

const manifest: { checks: { id: string }[] } = JSON.parse(
  readFileSync(path.join(ROOT, 'plugin.json'), 'utf8')
)

describe('plugin', () => {
  it('exports one function per check in plugin.json', () => {
    const ids = manifest.checks.map((check) => check.id)
    expect(Object.keys(plugin.checks).sort()).toEqual([...ids].sort())
    for (const check of Object.values(plugin.checks)) {
      expect(check).toBeTypeOf('function')
    }
  })

  it('lists the same check ids in CheckId', () => {
    expectTypeOf<keyof typeof plugin.checks>().toEqualTypeOf<CheckId>()
  })
})
