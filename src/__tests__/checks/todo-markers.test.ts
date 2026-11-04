import { createTestContext } from '@/__tests__/helpers/test-context'
import { minimalBook } from '@/__tests__/helpers/fixture-books'
import { describe, expect, it } from 'vitest'

import todoMarkers from '@/checks/todo-markers'

describe('todo-markers', () => {
  it('passes a book with no markers', () => {
    expect(todoMarkers(minimalBook())).toEqual([])
  })

  it('flags TODO, FIXME, and TK with their line and text', () => {
    const context = createTestContext({
      files: [
        {
          path: 'OEBPS/ch1.xhtml',
          text: '<p>TODO: tide tables</p>\n<p>Born in TK.</p>\n<p>FIXME</p>'
        }
      ]
    })
    expect(todoMarkers(context)).toEqual([
      {
        status: 'warning',
        message: 'Leftover TODO marker: "TODO: tide tables"',
        file: 'OEBPS/ch1.xhtml',
        line: 1
      },
      {
        status: 'warning',
        message: 'Leftover TK marker: "Born in TK."',
        file: 'OEBPS/ch1.xhtml',
        line: 2
      },
      {
        status: 'warning',
        message: 'Leftover FIXME marker: "FIXME"',
        file: 'OEBPS/ch1.xhtml',
        line: 3
      }
    ])
  })

  it('ignores partial words, markup, and non-XHTML files', () => {
    const context = createTestContext({
      files: [
        { path: 'OEBPS/ch1.xhtml', text: '<p class="TODO">TODOS and Tk</p>' },
        { path: 'OEBPS/notes.css', text: '/* TODO */' }
      ]
    })
    expect(todoMarkers(context)).toEqual([])
  })

  it('stops at 100 findings', () => {
    const text = Array.from({ length: 150 }, () => '<p>TODO</p>').join('\n')
    const context = createTestContext({
      files: [{ path: 'OEBPS/ch1.xhtml', text }]
    })
    expect(todoMarkers(context)).toHaveLength(100)
  })
})
