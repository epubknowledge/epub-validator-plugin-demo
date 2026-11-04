/** One chapter of a sample book. */
export interface SampleChapter {
  /** Manifest id, e.g. `ch1`. */
  id: string
  /** Heading and `<title>`. */
  title: string
  /** Paragraphs, one per line in the XHTML, so findings point at real lines. */
  paragraphs: string[]
}

/** A small book the demo's tests and `pnpm samples` both build from. */
export interface SampleBook {
  /** The `.epub` file name written to `samples/`. */
  filename: string
  /** The `dc:identifier`. */
  identifier: string
  title: string
  /** Whether the manifest declares a cover image. */
  cover: boolean
  chapters: SampleChapter[]
}

/** One file inside a sample book. */
export interface SampleFile {
  path: string
  mediaType: string
  text?: string
  bytes?: Uint8Array
}
