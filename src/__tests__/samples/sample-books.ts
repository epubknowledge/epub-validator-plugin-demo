import type { TestOpfInput } from '../helpers/types.ts'

import type { SampleBook, SampleChapter, SampleFile } from './types.ts'

// The books in samples/. Tests run every check against these definitions,
// and `pnpm samples` zips the same files into real EPUBs you can drop into
// the validator. Nothing here imports at run time, so the Node script can
// load it with type stripping.

// A 1x1 transparent PNG.
const COVER_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`

const STYLES_CSS = 'body { margin: 0 5%; }\n'

export const CLEAN_BOOK: SampleBook = {
  filename: 'demo-clean.epub',
  identifier: 'urn:uuid:7d3c1b0e-0000-4000-8000-000000000001',
  title: 'A Quiet Harbor',
  cover: true,
  chapters: [
    {
      id: 'ch1',
      title: 'Chapter One',
      paragraphs: [
        'The tide came in slowly over the flats.',
        'Gulls argued on the breakwater until dusk.'
      ]
    },
    {
      id: 'ch2',
      title: 'Chapter Two',
      paragraphs: ['By morning the harbor was still again.']
    }
  ]
}

export const FLAGGED_BOOK: SampleBook = {
  filename: 'demo-flagged.epub',
  identifier: 'urn:uuid:7d3c1b0e-0000-4000-8000-000000000002',
  title: 'A Noisy Harbor',
  cover: false,
  chapters: [
    {
      id: 'ch1',
      title: 'Chapter One',
      paragraphs: [
        'The tide came in slowly over the flats.',
        'TODO: check the tide tables for this scene.',
        'The harbormaster was born in TK and never left.'
      ]
    },
    {
      id: 'ch2',
      title: 'Chapter Two',
      paragraphs: [
        'PLUGIN-DEMO-ERROR',
        'By morning the harbor was still again.'
      ]
    }
  ]
}

export const SAMPLE_BOOKS: readonly SampleBook[] = [CLEAN_BOOK, FLAGGED_BOOK]

function chapterHref(chapter: SampleChapter): string {
  return `text/${chapter.id}.xhtml`
}

function xhtml(title: string, body: string[], stylesheet: string): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">',
    `<head><title>${title}</title><link rel="stylesheet" type="text/css" href="${stylesheet}"/></head>`,
    '<body>',
    ...body,
    '</body>',
    '</html>',
    ''
  ].join('\n')
}

function navXhtml(book: SampleBook): string {
  const items = book.chapters.map(
    (chapter) =>
      `<li><a href="${chapterHref(chapter)}">${chapter.title}</a></li>`
  )
  return xhtml(
    'Contents',
    [
      '<nav epub:type="toc" id="toc">',
      '<h1>Contents</h1>',
      '<ol>',
      ...items,
      '</ol>',
      '</nav>'
    ],
    'styles.css'
  )
}

function chapterXhtml(chapter: SampleChapter): string {
  return xhtml(
    chapter.title,
    [
      `<h1>${chapter.title}</h1>`,
      ...chapter.paragraphs.map((paragraph) => `<p>${paragraph}</p>`)
    ],
    '../styles.css'
  )
}

function contentOpf(book: SampleBook): string {
  const chapterItems = book.chapters.map(
    (chapter) =>
      `    <item id="${chapter.id}" href="${chapterHref(chapter)}" media-type="application/xhtml+xml"/>`
  )
  const coverItem = book.cover
    ? [
        '    <item id="cover" href="images/cover.png" media-type="image/png" properties="cover-image"/>'
      ]
    : []
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="pub-id" version="3.0">',
    '  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">',
    `    <dc:identifier id="pub-id">${book.identifier}</dc:identifier>`,
    `    <dc:title>${book.title}</dc:title>`,
    '    <dc:creator>Demo Org</dc:creator>',
    '    <dc:language>en</dc:language>',
    '    <meta property="dcterms:modified">2026-11-04T00:00:00Z</meta>',
    '  </metadata>',
    '  <manifest>',
    '    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    ...coverItem,
    ...chapterItems,
    '    <item id="css" href="styles.css" media-type="text/css"/>',
    '  </manifest>',
    '  <spine>',
    ...book.chapters.map((chapter) => `    <itemref idref="${chapter.id}"/>`),
    '  </spine>',
    '</package>',
    ''
  ].join('\n')
}

function base64Bytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

/** Every file in a sample book, `mimetype` first as EPUB requires. */
export function sampleBookFiles(book: SampleBook): SampleFile[] {
  const cover: SampleFile[] = book.cover
    ? [
        {
          path: 'OEBPS/images/cover.png',
          mediaType: 'image/png',
          bytes: base64Bytes(COVER_PNG)
        }
      ]
    : []
  return [
    { path: 'mimetype', mediaType: 'text/plain', text: 'application/epub+zip' },
    {
      path: 'META-INF/container.xml',
      mediaType: 'application/xml',
      text: CONTAINER_XML
    },
    {
      path: 'OEBPS/content.opf',
      mediaType: 'application/oebps-package+xml',
      text: contentOpf(book)
    },
    {
      path: 'OEBPS/nav.xhtml',
      mediaType: 'application/xhtml+xml',
      text: navXhtml(book)
    },
    ...book.chapters.map((chapter) => ({
      path: `OEBPS/${chapterHref(chapter)}`,
      mediaType: 'application/xhtml+xml',
      text: chapterXhtml(chapter)
    })),
    { path: 'OEBPS/styles.css', mediaType: 'text/css', text: STYLES_CSS },
    ...cover
  ]
}

/** The manifest and spine of a sample book, as `createTestOpf` takes them. */
export function sampleBookOpfInput(book: SampleBook): TestOpfInput {
  const cover = book.cover
    ? [
        {
          id: 'cover',
          href: 'images/cover.png',
          mediaType: 'image/png',
          properties: 'cover-image'
        }
      ]
    : []
  return {
    title: book.title,
    manifest: [
      {
        id: 'nav',
        href: 'nav.xhtml',
        mediaType: 'application/xhtml+xml',
        properties: 'nav'
      },
      ...cover,
      ...book.chapters.map((chapter) => ({
        id: chapter.id,
        href: chapterHref(chapter),
        mediaType: 'application/xhtml+xml'
      })),
      { id: 'css', href: 'styles.css', mediaType: 'text/css' }
    ],
    spine: book.chapters.map((chapter) => chapter.id)
  }
}
