import type { PluginOpf, PluginOpfMetadataEntry } from '../../contract.ts'

/** A file for `createTestContext`: pass `text` for text files, `bytes` for binary ones. */
export interface TestFileInput {
  path: string
  text?: string
  bytes?: Uint8Array
  /** Defaults to the media type for the file's extension. */
  mediaType?: string
}

export interface TestContextInput {
  files?: TestFileInput[]
  opf?: PluginOpf | null
  filename?: string
}

/** Plain values for `createTestOpf`; anything left out gets a sensible default. */
export interface TestOpfInput {
  path?: string
  /** Pass null for a book with no title. */
  title?: string | null
  identifiers?: string[]
  language?: string | null
  creators?: string[]
  entries?: PluginOpfMetadataEntry[]
  manifest?: {
    id: string
    href: string
    mediaType?: string
    properties?: string | null
  }[]
  /** Manifest ids, in reading order. */
  spine?: string[]
}
