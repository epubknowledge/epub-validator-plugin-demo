/**
 * Writes samples/*.epub from the definitions in
 * src/__tests__/samples/sample-books.ts. Run it after changing a sample:
 *
 *   pnpm samples
 *
 * The samples test fails when a committed .epub is out of date.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SAMPLE_BOOKS } from '../src/__tests__/samples/sample-books.ts'
import { sampleEpub } from './sample-epub.ts'

const SAMPLES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'samples')

mkdirSync(SAMPLES_DIR, { recursive: true })
for (const book of SAMPLE_BOOKS) {
  writeFileSync(join(SAMPLES_DIR, book.filename), sampleEpub(book))
  process.stdout.write(`wrote samples/${book.filename}\n`)
}
