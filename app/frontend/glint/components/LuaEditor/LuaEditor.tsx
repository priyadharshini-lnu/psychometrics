import React, { useEffect, useRef } from 'react'
import { UnControlled as CodeMirrorUnControlled, Controlled as CodeMirrorControlled } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/lua/lua'
import '@codemirror/autocomplete'

type LuaEditorProps = {
  onChange?: (value: string) => void
  value?: string
  controlled?: boolean
}

type Editor = {
  editor: {
    refresh: () => void
  }
}

export const LuaEditor: React.FC<LuaEditorProps> = ({ onChange, value, controlled }) => {
  const codemirrorRef = useRef(null)

  useEffect(() => {
    setTimeout(() => {
      if (!codemirrorRef.current) return
      const codemirror = codemirrorRef.current as Editor
      codemirror.editor?.refresh()
    }, 1000)
  }, [])

  const options = {
    foldGutter: true,
    lineNumbers: true,
    theme: 'default',
    mode: 'lua',
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
    },
  }

  return (
    controlled ? (
      <CodeMirrorControlled
        ref={codemirrorRef}
        value={value || ''}
        options={options}
        onBeforeChange={(editor, data, value) => { onChange ? onChange(value) : null }}
      />
    ) : (
      <CodeMirrorUnControlled
        ref={codemirrorRef}
        value={value}
        options={options}
        onChange={(editor, data, value) => { onChange ? onChange(value) : null }}
      />
    )
  )
}
