import { type CompletionContext, type CompletionResult, type Completion } from '@codemirror/autocomplete'

export function luaFormulaCompletionSource (
  context: CompletionContext, autoCompletions: Completion[],
): CompletionResult | null {
  const word = context.matchBefore(/[\w.]+/)
  if (!word || (word.from === word.to && !context.explicit)) return null
  return {
    from: word.from,
    options: autoCompletions,
    validFor: /^[\w.]*$/,
  }
}
