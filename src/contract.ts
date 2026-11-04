// The parts of the validator's plugin contract this plugin uses, copied here
// so the plugin has no dependencies. They're types only: the validator strips
// them before it runs the plugin.

/** A finding's status, most severe first: error, warning, info, success. */
export type PluginSeverity = 'error' | 'warning' | 'info' | 'success'

/** One file in the book, as a plugin sees it. */
export interface PluginFile {
  /** Path inside the EPUB, e.g. `OEBPS/ch1.xhtml`. */
  readonly path: string
  readonly mediaType: string
  /** Size in bytes. */
  readonly size: number
  /** The decoded text, for text files. */
  readonly text?: string
  /** The raw bytes, for binary files. */
  readonly bytes?: Uint8Array
}

export interface PluginOpfMetadataEntry {
  readonly name: string
  readonly value: string
}

export interface PluginOpfMetadata {
  readonly title: string | null
  /** The first `dc:identifier`. */
  readonly identifier: string | null
  readonly identifiers: readonly string[]
  readonly language: string | null
  readonly creators: readonly string[]
  /** Every child of `<metadata>` in order, `meta` elements by their property or name. */
  readonly entries: readonly PluginOpfMetadataEntry[]
}

export interface PluginOpfManifestItem {
  readonly id: string
  readonly href: string
  /** `href` resolved against the OPF's directory, or `href` itself when external. */
  readonly path: string
  readonly mediaType: string | null
  readonly properties: string | null
}

export interface PluginOpfSpineItem {
  readonly idref: string
  readonly linear: boolean
  /** The manifest item's resolved path, or null when `idref` matches no item. */
  readonly path: string | null
}

/** The parsed package document. */
export interface PluginOpf {
  /** Path of the OPF file inside the EPUB. */
  readonly path: string
  readonly metadata: PluginOpfMetadata
  readonly manifest: readonly PluginOpfManifestItem[]
  readonly spine: readonly PluginOpfSpineItem[]
}

/** What a check receives. Read-only: no settings, network, storage, or DOM. */
export interface PluginContext {
  readonly files: readonly PluginFile[]
  /** Null when the OPF is missing or doesn't parse. */
  readonly opf: PluginOpf | null
  readonly book: { readonly filename: string }
}

/** What a check returns, one per problem (or pass) it reports. */
export interface PluginFinding {
  /** Never more severe than the check's declared severity. */
  status: PluginSeverity
  /** 1–500 characters of plain text; never rendered as HTML. */
  message: string
  /** A path in `context.files`. */
  file?: string | null
  /** 1-based. */
  line?: number | null
}

export type PluginCheckResult = PluginFinding[] | Promise<PluginFinding[]>

export type PluginCheck = (context: PluginContext) => PluginCheckResult

/** `src/plugin.ts`'s default export: one function per declared check id. */
export interface PluginModule<CheckId extends string = string> {
  checks: Record<CheckId, PluginCheck>
}
