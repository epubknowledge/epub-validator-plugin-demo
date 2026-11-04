import { describe, expect, it } from 'vitest'

import { findLines, isXhtml, snippet, stripTags } from '@/lib/text'

describe('isXhtml', () => {
  it('accepts only XHTML files with decoded text', () => {
    expect(
      isXhtml({
        path: 'a.xhtml',
        mediaType: 'application/xhtml+xml',
        size: 1,
        text: '<p/>'
      })
    ).toBe(true)
    expect(
      isXhtml({ path: 'a.xhtml', mediaType: 'application/xhtml+xml', size: 1 })
    ).toBe(false)
    expect(
      isXhtml({ path: 'a.css', mediaType: 'text/css', size: 1, text: 'p {}' })
    ).toBe(false)
  })
})

describe('stripTags', () => {
  it('removes tags and collapses whitespace', () => {
    expect(stripTags('  <p class="x">Hello,\n  <em>world</em></p> ')).toBe(
      'Hello, world'
    )
  })

  it('keeps a stray < and still strips the tag after it', () => {
    expect(stripTags('a < b <em>c</em>')).toBe('a < b c')
  })

  it('handles a long run of unclosed < quickly', () => {
    const start = performance.now()
    expect(stripTags('<'.repeat(50_000))).toBe('<'.repeat(50_000))
    expect(performance.now() - start).toBeLessThan(100)
  })
})

describe('snippet', () => {
  it('keeps short text and cuts long text to 80 characters', () => {
    expect(snippet('short')).toBe('short')
    const long = 'x'.repeat(100)
    expect(snippet(long)).toHaveLength(80)
    expect(snippet(long).endsWith('…')).toBe(true)
  })
})

describe('findLines', () => {
  it('returns 1-based lines whose visible text matches, with the match', () => {
    const text = '<p>one</p>\n<p>TODO two</p>\n<p class="TODO">three</p>'
    expect(findLines(text, /TODO/)).toEqual([
      { line: 2, text: 'TODO two', match: 'TODO' }
    ])
  })
})
