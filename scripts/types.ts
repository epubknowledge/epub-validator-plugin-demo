/** One file to store in a ZIP archive. */
export interface ZipEntry {
  /** Path inside the archive, with `/` separators. */
  path: string
  data: Uint8Array
}
