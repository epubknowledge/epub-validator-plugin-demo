import type {
  PluginContext,
  PluginFinding
} from '../contract'

import { findLines, isXhtml, snippet } from '../lib/text'

// Whole words only, so "TODOS" or "Tk" don't match.
const MARKER = /\b(?:TODO|FIXME|TK)\b/

// The validator accepts up to 1,000 findings per check; a demo needs far fewer.
const MAX_FINDINGS = 100

/** Flags editorial markers left in XHTML content, one finding per line. */
export default function todoMarkers(context: PluginContext): PluginFinding[] {
  const findings = context.files.filter(isXhtml).flatMap((file) =>
    findLines(file.text, MARKER).map(({ line, text, match }) => ({
      status: 'warning' as const,
      message: `Leftover ${match} marker: "${snippet(text)}"`,
      file: file.path,
      line
    }))
  )
  return findings.slice(0, MAX_FINDINGS)
}
