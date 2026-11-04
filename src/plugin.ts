import type { PluginModule } from './contract'

import coverImage from './checks/cover-image'
import demoErrorMarker from './checks/demo-error-marker'
import runSummary from './checks/run-summary'
import todoMarkers from './checks/todo-markers'
import wordCount from './checks/word-count'

// Every check id in plugin.json. The contract test fails if they differ.
export type CheckId =
  | 'demo-error-marker'
  | 'todo-markers'
  | 'cover-image'
  | 'run-summary'
  | 'word-count'

export default {
  checks: {
    'demo-error-marker': demoErrorMarker,
    'todo-markers': todoMarkers,
    'cover-image': coverImage,
    'run-summary': runSummary,
    'word-count': wordCount
  }
} satisfies PluginModule<CheckId>
