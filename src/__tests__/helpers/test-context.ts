import type {
  PluginContext,
  PluginFile,
  PluginOpf,
  PluginOpfManifestItem,
  PluginOpfMetadata,
  PluginOpfSpineItem
} from '@/contract'

import type { TestContextInput, TestFileInput, TestOpfInput } from './types'

// Builds the context a check receives, the way the validator builds it, so
// the tests can run checks without the validator.

const DEFAULT_IDENTIFIER = 'urn:uuid:00000000-0000-0000-0000-000000000000'

// The media types the validator gives a file it has no OPF media type for.
const MEDIA_TYPES: Record<string, string> = {
  css: 'text/css',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  ncx: 'application/x-dtbncx+xml',
  opf: 'application/oebps-package+xml',
  otf: 'font/otf',
  png: 'image/png',
  svg: 'image/svg+xml',
  ttf: 'font/ttf',
  webp: 'image/webp',
  woff: 'font/woff',
  woff2: 'font/woff2',
  xhtml: 'application/xhtml+xml',
  html: 'application/xhtml+xml',
  xml: 'application/xml'
}

/** A file's media type, from its extension. */
export function mediaTypeFor(path: string): string {
  const extension = path.split('.').at(-1)?.toLowerCase() ?? ''
  if (path === 'mimetype') return 'text/plain'
  return MEDIA_TYPES[extension] ?? 'application/octet-stream'
}

function toPluginFile(input: TestFileInput): PluginFile {
  const mediaType = input.mediaType ?? mediaTypeFor(input.path)
  if (input.bytes !== undefined) {
    return {
      path: input.path,
      mediaType,
      size: input.bytes.byteLength,
      bytes: input.bytes
    }
  }
  const text = input.text ?? ''
  return {
    path: input.path,
    mediaType,
    size: new TextEncoder().encode(text).byteLength,
    text
  }
}

function resolveHref(opfPath: string, href: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return href
  const dir = opfPath.includes('/')
    ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1)
    : ''
  const parts: string[] = []
  for (const segment of `${dir}${href.split('#')[0] ?? ''}`.split('/')) {
    if (segment === '..') parts.pop()
    else if (segment !== '' && segment !== '.') parts.push(segment)
  }
  return parts.join('/')
}

/**
 * Builds a `PluginOpf` the way the validator does, from plain values:
 * manifest `path`s resolve against the OPF's directory, spine items find
 * their manifest item's path, and `identifier` is the first identifier.
 */
export function createTestOpf(input: TestOpfInput = {}): PluginOpf {
  const path = input.path ?? 'OEBPS/content.opf'
  const identifiers = input.identifiers ?? [DEFAULT_IDENTIFIER]
  // Defaults, not `??`: an explicit null means the book has no title or
  // language, and only undefined falls back.
  const { title = 'Test Book', language = 'en' } = input
  const metadata: PluginOpfMetadata = {
    title,
    identifier: identifiers[0] ?? null,
    identifiers,
    language,
    creators: input.creators ?? [],
    entries: input.entries ?? []
  }
  const manifest: PluginOpfManifestItem[] = (input.manifest ?? []).map(
    (item) => {
      const itemPath = resolveHref(path, item.href)
      return {
        id: item.id,
        href: item.href,
        path: itemPath,
        mediaType: item.mediaType ?? mediaTypeFor(itemPath),
        properties: item.properties ?? null
      }
    }
  )
  const spine: PluginOpfSpineItem[] = (input.spine ?? []).map((idref) => ({
    idref,
    linear: true,
    path: manifest.find((item) => item.id === idref)?.path ?? null
  }))
  return { path, metadata, manifest, spine }
}

/**
 * Builds the `PluginContext` a check receives. Text files get their `text`
 * and UTF-8 `size`; pass `bytes` for binary files. `opf` defaults to null,
 * as for a book whose OPF doesn't parse.
 */
export function createTestContext(
  options: TestContextInput = {}
): PluginContext {
  return {
    files: (options.files ?? []).map(toPluginFile),
    opf: options.opf ?? null,
    book: { filename: options.filename ?? 'test-book.epub' }
  }
}
