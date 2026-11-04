import { createTestContext } from '@/__tests__/helpers/test-context'
import {
  bookWithoutOpf,
  minimalBook
} from '@/__tests__/helpers/fixture-books'
import { describe, expect, it } from 'vitest'

import runSummary from '@/checks/run-summary'

describe('run-summary', () => {
  it('describes what the plugin saw, on the OPF', () => {
    expect(runSummary(minimalBook())).toEqual([
      {
        status: 'info',
        message:
          'Plugin Demo ran on a-quiet-harbor.epub: 7 files, 3 XHTML documents, 2 spine items.',
        file: 'OEBPS/content.opf'
      }
    ])
  })

  it('uses the singular and still reports without an OPF', () => {
    const context = createTestContext({
      files: [{ path: 'OEBPS/ch1.xhtml', text: '<p/>' }],
      filename: 'one.epub'
    })
    expect(runSummary(context)).toEqual([
      {
        status: 'info',
        message:
          'Plugin Demo ran on one.epub: 1 file, 1 XHTML document, no readable OPF.',
        file: null
      }
    ])
    expect(runSummary(bookWithoutOpf())).toHaveLength(1)
  })
})
