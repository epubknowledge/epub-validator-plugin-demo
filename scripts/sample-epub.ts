import { sampleBookFiles } from '../src/__tests__/samples/sample-books.ts'
import type { SampleBook } from '../src/__tests__/samples/types.ts'
import { zipStored } from './zip.ts'

/** A sample book as `.epub` bytes. The same book always gives the same bytes. */
export function sampleEpub(book: SampleBook): Buffer {
  return zipStored(
    sampleBookFiles(book).map((file) => ({
      path: file.path,
      data: file.bytes ?? new TextEncoder().encode(file.text ?? '')
    }))
  )
}
