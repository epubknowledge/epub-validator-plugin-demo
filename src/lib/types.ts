/** One line of a file whose visible text matched a pattern. */
export interface MatchedLine {
  /** 1-based. */
  line: number
  /** The line's visible text, tags removed and trimmed. */
  text: string
  /** The text the pattern matched. */
  match: string
}
