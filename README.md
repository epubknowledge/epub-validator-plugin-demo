# Plugin Demo: an EPUB validator plugin to try plugins out

A working validator plugin built to show how plugins behave, not to check anything you care about. Install it in the validator, drop one of the sample books in, and you'll see every finding status a plugin can report.

It's also a small worked example of writing checks and testing them.

## What it checks

| Check               | Reports               | On by default | How to trigger it                                                  |
| ------------------- | --------------------- | ------------- | ------------------------------------------------------------------ |
| `demo-error-marker` | error                 | yes           | Put the text `PLUGIN-DEMO-ERROR` in any text file of a book.       |
| `todo-markers`      | warning, with a line  | yes           | Leave `TODO`, `FIXME`, or `TK` in a chapter.                       |
| `cover-image`       | warning, or success   | yes           | Warns when no manifest item has `properties="cover-image"`.        |
| `run-summary`       | info                  | yes           | Always fires once, so you can tell the plugin ran.                 |
| `word-count`        | info, one per chapter | **no**        | Switch it on in the plugin's settings to see a toggle take effect. |

## Sample books

`samples/` holds two small, valid EPUB 3 books (both pass epubcheck with no messages):

- **`demo-clean.epub`**: has a cover. Reports one success (cover) and one info (summary).
- **`demo-flagged.epub`**: no cover, a `TODO` and a `TK`, and the error marker. Reports one error, three warnings, and one info, so the book rolls up as an error.

`src/__tests__/samples.test.ts` lists exactly what each book reports. The books are built from `src/__tests__/samples/sample-books.ts`; after changing that file, run `pnpm samples` to rewrite the `.epub` files. The test fails when they're out of date.

## Try it in the validator

1. Open **Plugins** at the bottom of the validator's sidebar, paste this repo's link, and click **Install**. A **Plugin Demo** area appears in the sidebar.
2. Upload `samples/demo-flagged.epub`. The Plugin Demo area lists the error, the three warnings, and the summary, and the book's overall status turns to error.
3. Upload `samples/demo-clean.epub`. You'll see only the cover success and the summary.
4. In the plugin's settings, switch on **Word count per chapter** and switch off **Demo error marker**, then look at the flagged book again.
5. Edit a book of your own: add `PLUGIN-DEMO-ERROR` or a `TODO` to a chapter and upload it.

## Make your own copy

To install a copy from your own GitHub account or organization:

1. Copy this repo into a new one and set `repository` in `plugin.json` to its link, `https://github.com/<owner>/<repo>`. The validator refuses a plugin whose `repository` doesn't match the link you paste.
2. Run the tests (below). They write `coverage/coverage-summary.json`; copy it to `release/coverage-summary.json` and commit it. The validator reads it at the release's tag and refuses anything under 100%.
3. Push, then create a release whose tag is `v` plus `plugin.json`'s `version`:

   ```sh
   gh release create v1.0.0 --title v1.0.0 --notes "First release"
   ```

   Create a GitHub release, not just a tag: the validator finds the latest release from the plain repo link. With only a tag, paste `https://github.com/<owner>/<repo>/releases/tag/v1.0.0` instead.

A private repo works too, but the validator needs its GitHub App installed on that repo and you signed in with GitHub.

## Develop

```sh
pnpm install
pnpm test         # 100% coverage, plus the plugin and samples tests
pnpm type-check
pnpm samples      # rebuild samples/*.epub
```

The plugin has no dependencies. `src/contract.ts` holds the validator's plugin types it uses, and `src/__tests__/helpers/` builds the context a check receives, so the tests run without the validator.

The validator's rules for plugin code apply: TypeScript only, runtime code in `src/` imports only other files in `src/` (with `import type` for types), no enums, namespaces, or decorators, and 100% test coverage. `scripts/` and `src/__tests__/` aren't runtime code, so they may use Node APIs.
