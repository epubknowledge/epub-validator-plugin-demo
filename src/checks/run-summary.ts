import type {
  PluginContext,
  PluginFinding
} from '../contract'

import { isXhtml } from '../lib/text'

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

/** Always reports one info line describing what the plugin received. */
export default function runSummary(context: PluginContext): PluginFinding[] {
  const opf = context.opf
  const parts = [
    plural(context.files.length, 'file'),
    plural(context.files.filter(isXhtml).length, 'XHTML document'),
    opf ? plural(opf.spine.length, 'spine item') : 'no readable OPF'
  ]
  return [
    {
      status: 'info',
      message: `Plugin Demo ran on ${context.book.filename}: ${parts.join(', ')}.`,
      file: opf?.path ?? null
    }
  ]
}
