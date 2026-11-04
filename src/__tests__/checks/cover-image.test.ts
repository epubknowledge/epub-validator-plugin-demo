import {
  createTestContext,
  createTestOpf
} from '@/__tests__/helpers/test-context'
import {
  bookWithoutOpf,
  minimalBook
} from '@/__tests__/helpers/fixture-books'
import { describe, expect, it } from 'vitest'

import coverImage from '@/checks/cover-image'

function bookWithCover(properties: string, files = true) {
  return createTestContext({
    files: files
      ? [{ path: 'OEBPS/images/cover.png', bytes: new Uint8Array([1]) }]
      : [],
    opf: createTestOpf({
      manifest: [
        { id: 'cover', href: 'images/cover.png', properties },
        { id: 'ch1', href: 'text/ch1.xhtml' }
      ],
      spine: ['ch1']
    })
  })
}

describe('cover-image', () => {
  it('reports success when the manifest declares a cover image', () => {
    expect(coverImage(bookWithCover('cover-image'))).toEqual([
      {
        status: 'success',
        message: 'Cover image declared: OEBPS/images/cover.png.',
        file: 'OEBPS/images/cover.png'
      }
    ])
  })

  it('finds cover-image among other properties', () => {
    expect(coverImage(bookWithCover('svg cover-image'))[0]?.status).toBe(
      'success'
    )
  })

  it('points at the OPF when the cover file is missing from the book', () => {
    expect(coverImage(bookWithCover('cover-image', false))[0]?.file).toBe(
      'OEBPS/content.opf'
    )
  })

  it('warns when no item is the cover image', () => {
    expect(coverImage(minimalBook())).toEqual([
      expect.objectContaining({ status: 'warning', file: 'OEBPS/content.opf' })
    ])
    expect(coverImage(bookWithCover('cover-images'))[0]?.status).toBe('warning')
  })

  it('skips a book with no OPF', () => {
    expect(coverImage(bookWithoutOpf())).toEqual([])
  })
})
