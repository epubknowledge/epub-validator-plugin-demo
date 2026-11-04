import type {
  PluginContext,
  PluginFinding
} from '../contract'

const COVER_IMAGE = /(^|\s)cover-image(\s|$)/

/**
 * Passes when the manifest declares a cover image, and warns when it
 * doesn't. Shows a check reporting both a success and a warning.
 */
export default function coverImage(context: PluginContext): PluginFinding[] {
  const opf = context.opf
  if (!opf) return []

  const cover = opf.manifest.find((item) =>
    COVER_IMAGE.test(item.properties ?? '')
  )
  if (!cover) {
    return [
      {
        status: 'warning',
        message:
          'No manifest item has properties="cover-image". Add it to the cover image\'s <item> so reading systems and stores can find the cover.',
        file: opf.path
      }
    ]
  }

  // A finding may only name a file that's in the book.
  const inBook = context.files.some((file) => file.path === cover.path)
  return [
    {
      status: 'success',
      message: `Cover image declared: ${cover.path}.`,
      file: inBook ? cover.path : opf.path
    }
  ]
}
