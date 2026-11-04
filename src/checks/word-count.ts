import type {
  PluginContext,
  PluginFinding
} from '../contract'

import { isXhtml, stripTags } from '../lib/text'

const BODY = /<body[^>]*>([\s\S]*)<\/body>/i

function countWords(markup: string): number {
  const body = BODY.exec(markup)?.[1] ?? markup
  const text = stripTags(body)
  return text === '' ? 0 : text.split(' ').length
}

/**
 * Reports each reading-order document's word count. It's off by default in
 * plugin.json, so it only runs once a user switches it on.
 */
export default function wordCount(context: PluginContext): PluginFinding[] {
  const opf = context.opf
  if (!opf) return []

  const files = new Map(
    context.files.filter(isXhtml).map((file) => [file.path, file])
  )
  return opf.spine.flatMap((item) => {
    const file = item.path === null ? undefined : files.get(item.path)
    if (!file) return []
    const words = countWords(file.text)
    return [
      {
        status: 'info' as const,
        message: `${words.toLocaleString('en-US')} ${words === 1 ? 'word' : 'words'}.`,
        file: file.path
      }
    ]
  })
}
