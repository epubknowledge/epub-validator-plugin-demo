import {
  createTestContext,
  createTestOpf
} from '@/__tests__/helpers/test-context'
import {
  bookWithoutOpf,
  minimalBook
} from '@/__tests__/helpers/fixture-books'
import { describe, expect, it } from 'vitest'

import wordCount from '@/checks/word-count'

describe('word-count', () => {
  it('counts the words in each reading-order document', () => {
    expect(wordCount(minimalBook())).toEqual([
      {
        status: 'info',
        message: '5 words.',
        file: 'OEBPS/copyright.xhtml'
      },
      { status: 'info', message: '6 words.', file: 'OEBPS/text/ch1.xhtml' }
    ])
  })

  it('handles one word, no words, a missing body, and big numbers', () => {
    const context = createTestContext({
      files: [
        {
          path: 'OEBPS/one.xhtml',
          text: '<html><body><p>Hi</p></body></html>'
        },
        { path: 'OEBPS/empty.xhtml', text: '<html><body> </body></html>' },
        { path: 'OEBPS/bare.xhtml', text: `<p>${'word '.repeat(1200)}</p>` }
      ],
      opf: createTestOpf({
        manifest: [
          { id: 'one', href: 'one.xhtml' },
          { id: 'empty', href: 'empty.xhtml' },
          { id: 'bare', href: 'bare.xhtml' }
        ],
        spine: ['one', 'empty', 'bare']
      })
    })
    expect(wordCount(context).map((finding) => finding.message)).toEqual([
      '1 word.',
      '0 words.',
      '1,200 words.'
    ])
  })

  it('skips spine items with no manifest item or no file', () => {
    const context = createTestContext({
      files: [],
      opf: createTestOpf({
        manifest: [{ id: 'ch1', href: 'ch1.xhtml' }],
        spine: ['ch1', 'missing']
      })
    })
    expect(wordCount(context)).toEqual([])
  })

  it('skips a book with no OPF', () => {
    expect(wordCount(bookWithoutOpf())).toEqual([])
  })
})
