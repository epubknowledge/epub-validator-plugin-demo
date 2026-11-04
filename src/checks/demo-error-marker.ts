import type {
  PluginContext,
  PluginFinding
} from '../contract'

import { findLines } from '../lib/text'

/** The text that makes this check fire. Put it in any text file of a book. */
export const DEMO_ERROR_MARKER = 'PLUGIN-DEMO-ERROR'

const MARKER = /PLUGIN-DEMO-ERROR/

/**
 * Reports an error on every line that contains the demo marker. It exists so
 * you can make a plugin report an error on purpose and watch it roll up into
 * the book's status.
 */
export default function demoErrorMarker(
  context: PluginContext
): PluginFinding[] {
  return context.files.flatMap((file) =>
    findLines(file.text ?? '', MARKER).map(({ line }) => ({
      status: 'error' as const,
      message: `Found the ${DEMO_ERROR_MARKER} marker. This check reports it on purpose so you can see an error finding; remove the marker to clear it.`,
      file: file.path,
      line
    }))
  )
}
