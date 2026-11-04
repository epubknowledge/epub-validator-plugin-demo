import type { PluginFile } from '../contract'

import type { MatchedLine } from './types'

// Excluding `<` as well as `>` stops each attempt at the next `<`, so an
// unclosed `<<<<…` can't make every position scan to the end of the line.
const TAG = /<[^<>]*>/g
const WHITESPACE = /\s+/g
const MAX_SNIPPET = 80

/** Whether a file is an XHTML content document with its text decoded. */
export function isXhtml(
  file: PluginFile
): file is PluginFile & { text: string } {
  return file.mediaType === 'application/xhtml+xml' && file.text !== undefined
}

/** The visible text of some markup: tags removed, whitespace collapsed. */
export function stripTags(markup: string): string {
  return markup.replaceAll(TAG, ' ').replaceAll(WHITESPACE, ' ').trim()
}

/** A line's visible text, cut to fit in a finding message. */
export function snippet(text: string): string {
  return text.length > MAX_SNIPPET ? `${text.slice(0, MAX_SNIPPET - 1)}…` : text
}

/**
 * Every line whose visible text `pattern` matches, in order. Tags are
 * stripped first, so a match inside an attribute value never counts. Pass a
 * pattern without the `g` flag.
 */
export function findLines(text: string, pattern: RegExp): MatchedLine[] {
  return text.split('\n').flatMap((content, index) => {
    const visible = stripTags(content)
    const match = pattern.exec(visible)
    return match ? [{ line: index + 1, text: visible, match: match[0] }] : []
  })
}
