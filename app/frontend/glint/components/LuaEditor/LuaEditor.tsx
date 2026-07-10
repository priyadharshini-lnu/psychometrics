import React from 'react'
import { type Completion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete'
import { ReactCodemirror } from '~/glint/components/ReactCodemirror'
import { luaFormulaCompletionSource } from './luaFormulaCompletions'

type LuaEditorProps = {
  onChange?: (value: string) => void
  value?: string
  mode?: 'lua' | 'javascript' | 'json',
  autoCompletions?: Completion[]
}

export const LuaEditor: React.FC<LuaEditorProps> = ({
  onChange, value, mode = 'lua', autoCompletions = [],
}) => {
  const completionSources = autoCompletions.length > 0
    ? [(context: CompletionContext): CompletionResult | null => luaFormulaCompletionSource(context, autoCompletions)]
    : []

  return (
    <ReactCodemirror
      value={value}
      onChange={onChange}
      mode={mode}
      lineNumbers
      foldGutter
      autocomplete
      completionSources={completionSources}
      minHeight="320px"
    />
  )
}
