import type { PluginContext, PluginOpf } from '@/contract'

import { createTestContext, createTestOpf } from './test-context'
import type { TestFileInput, TestOpfInput } from './types'

// Small books for the check tests, with their `opf` built the way the
// validator builds it from the OPF text below.

const CONTAINER_XML = `<?xml version="1.0"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`

const CONTENT_OPF = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="pub-id" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">urn:isbn:9780000000001</dc:identifier>
    <dc:title>A Quiet Harbor</dc:title>
    <dc:creator>Jordan Reyes</dc:creator>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="copyright" href="copyright.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="css" href="styles.css" media-type="text/css"/>
  </manifest>
  <spine>
    <itemref idref="copyright"/>
    <itemref idref="ch1"/>
  </spine>
</package>`

function xhtml(title: string, body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
<head><title>${title}</title></head>
<body>${body}</body>
</html>`
}

/** The files of the minimal book, so a test can add, drop, or edit one. */
export function minimalBookFiles(): TestFileInput[] {
  return [
    { path: 'mimetype', text: 'application/epub+zip' },
    { path: 'META-INF/container.xml', text: CONTAINER_XML },
    { path: 'OEBPS/content.opf', text: CONTENT_OPF },
    {
      path: 'OEBPS/nav.xhtml',
      text: xhtml(
        'Contents',
        '<nav epub:type="toc"><ol><li><a href="text/ch1.xhtml">One</a></li></ol></nav>'
      )
    },
    {
      path: 'OEBPS/copyright.xhtml',
      text: xhtml(
        'Copyright',
        '<section epub:type="copyright-page"><p>Copyright © 2026 Jordan Reyes.</p></section>'
      )
    },
    {
      path: 'OEBPS/text/ch1.xhtml',
      text: xhtml('One', '<h1>Chapter One</h1><p>The tide came in.</p>')
    },
    { path: 'OEBPS/styles.css', text: 'body { margin: 0; }' }
  ]
}

/** The minimal book's OPF as the validator parses it. Override any field. */
export function minimalBookOpf(overrides: TestOpfInput = {}): PluginOpf {
  return createTestOpf({
    title: 'A Quiet Harbor',
    identifiers: ['urn:isbn:9780000000001'],
    language: 'en',
    creators: ['Jordan Reyes'],
    entries: [
      { name: 'identifier', value: 'urn:isbn:9780000000001' },
      { name: 'title', value: 'A Quiet Harbor' },
      { name: 'creator', value: 'Jordan Reyes' },
      { name: 'language', value: 'en' },
      { name: 'dcterms:modified', value: '2026-01-01T00:00:00Z' }
    ],
    manifest: [
      { id: 'nav', href: 'nav.xhtml', properties: 'nav' },
      { id: 'copyright', href: 'copyright.xhtml' },
      { id: 'ch1', href: 'text/ch1.xhtml' },
      { id: 'css', href: 'styles.css' }
    ],
    spine: ['copyright', 'ch1'],
    ...overrides
  })
}

/**
 * A small, valid EPUB 3 book: a title, one author, a copyright page and one
 * chapter in the spine, a nav document, and a stylesheet.
 */
export function minimalBook(overrides: TestOpfInput = {}): PluginContext {
  return createTestContext({
    files: minimalBookFiles(),
    opf: minimalBookOpf(overrides),
    filename: 'a-quiet-harbor.epub'
  })
}

/** A book whose OPF is missing, so `context.opf` is null. */
export function bookWithoutOpf(): PluginContext {
  return createTestContext({
    files: minimalBookFiles().filter((file) => !file.path.endsWith('.opf')),
    opf: null,
    filename: 'no-opf.epub'
  })
}
