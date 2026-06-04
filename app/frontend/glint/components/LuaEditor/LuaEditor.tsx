import React from 'react'
import { ReactCodemirror } from '~/glint/components/ReactCodemirror'

type LuaEditorProps = {
  onChange?: (value: string) => void
  value?: string
  mode?: 'lua' | 'javascript' | 'json'
}

export const LuaEditor: React.FC<LuaEditorProps> = ({
  onChange, value, mode = 'lua',
}) => (
  <ReactCodemirror
    value={value}
    onChange={onChange}
    mode={mode}
    lineNumbers
    foldGutter
    autocomplete
    minHeight="320px"
  />
)
