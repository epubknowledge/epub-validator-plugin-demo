import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import type { PluginContext } from '@/contract'
import plugin from '@/plugin'
import {
  createTestContext,
  createTestOpf
} from '@/__tests__/helpers/test-context'
import {
  CLEAN_BOOK,
  FLAGGED_BOOK,
  SAMPLE_BOOKS,
  sampleBookFiles,
  sampleBookOpfInput
} from '@/__tests__/samples/sample-books'
import type { SampleBook } from '@/__tests__/samples/types'

import { sampleEpub } from '../../scripts/sample-epub'

// Runs the whole plugin over the books in samples/, the way the validator
// does: every check that's on by default. Read this file to see what each
// sample should report.

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
)

interface ManifestCheck {
  id: keyof typeof plugin.checks
  enabled: boolean
}

const manifest: { checks: ManifestCheck[] } = JSON.parse(
  readFileSync(path.join(ROOT, 'plugin.json'), 'utf8')
)

function contextFor(book: SampleBook): PluginContext {
  return createTestContext({
    files: sampleBookFiles(book),
    opf: createTestOpf(sampleBookOpfInput(book)),
    filename: book.filename
  })
}

/** Runs every check that's on by default, as `checkId: status message`. */
async function runEnabledChecks(book: SampleBook): Promise<string[]> {
  const context = contextFor(book)
  const rows: string[] = []
  for (const check of manifest.checks.filter((entry) => entry.enabled)) {
    for (const finding of await plugin.checks[check.id](context)) {
      rows.push(`${check.id}: ${finding.status} ${finding.message}`)
    }
  }
  return rows
}

describe('sample books', () => {
  it('demo-clean.epub reports only the summary and a passing cover', async () => {
    expect(await runEnabledChecks(CLEAN_BOOK)).toEqual([
      'cover-image: success Cover image declared: OEBPS/images/cover.png.',
      'run-summary: info Plugin Demo ran on demo-clean.epub: 8 files, 3 XHTML documents, 2 spine items.'
    ])
  })

  it('demo-flagged.epub reports an error, warnings, and the summary', async () => {
    expect(await runEnabledChecks(FLAGGED_BOOK)).toEqual([
      expect.stringMatching(
        /^demo-error-marker: error Found the PLUGIN-DEMO-ERROR marker/
      ),
      'todo-markers: warning Leftover TODO marker: "TODO: check the tide tables for this scene."',
      'todo-markers: warning Leftover TK marker: "The harbormaster was born in TK and never left."',
      expect.stringMatching(
        /^cover-image: warning No manifest item has properties="cover-image"/
      ),
      'run-summary: info Plugin Demo ran on demo-flagged.epub: 7 files, 3 XHTML documents, 2 spine items.'
    ])
  })

  it('keeps word-count off by default', () => {
    expect(
      manifest.checks.find((check) => check.id === 'word-count')?.enabled
    ).toBe(false)
  })

  it.each(
    SAMPLE_BOOKS
  )('$filename in samples/ is up to date (run `pnpm samples`)', (book) => {
    const committed = readFileSync(path.join(ROOT, 'samples', book.filename))
    expect(committed.equals(sampleEpub(book))).toBe(true)
  })
})
