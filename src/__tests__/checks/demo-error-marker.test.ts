import { createTestContext } from '@/__tests__/helpers/test-context'
import { minimalBook } from '@/__tests__/helpers/fixture-books'
import { describe, expect, it } from 'vitest'

import demoErrorMarker, { DEMO_ERROR_MARKER } from '@/checks/demo-error-marker'

describe('demo-error-marker', () => {
  it('passes a book without the marker', () => {
    expect(demoErrorMarker(minimalBook())).toEqual([])
  })

  it('reports an error on each line with the marker, in any text file', () => {
    const context = createTestContext({
      files: [
        {
          path: 'OEBPS/ch1.xhtml',
          text: `<p>fine</p>\n<p>${DEMO_ERROR_MARKER}</p>`
        },
        { path: 'OEBPS/styles.css', text: `/* ${DEMO_ERROR_MARKER} */` },
        { path: 'OEBPS/cover.png', bytes: new Uint8Array([1, 2, 3]) }
      ]
    })
    const findings = demoErrorMarker(context)
    expect(findings).toHaveLength(2)
    expect(findings[0]).toMatchObject({
      status: 'error',
      file: 'OEBPS/ch1.xhtml',
      line: 2
    })
    expect(findings[0]?.message).toContain(DEMO_ERROR_MARKER)
    expect(findings[1]).toMatchObject({ file: 'OEBPS/styles.css', line: 1 })
  })
})
