import React, { useEffect, useRef } from 'react'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/lua/lua'

type LuaEditorProps = {
  onChange?: (value: string) => void
  value: string
}

type Editor = {
  editor: {
    refresh: () => void
  }
}

const LuaEditor: React.FC<LuaEditorProps> = ({ onChange, value }) => {
  const codemirrorRef = useRef(null)

  useEffect(() => {
    setTimeout(() => {
      if (!codemirrorRef.current) return
      const codemirror = codemirrorRef.current as Editor
      codemirror.editor?.refresh()
    }, 1000)
  }, [])


  return (
    <CodeMirror
      ref={codemirrorRef}
      value={value}
      options={{
        foldGutter: true,
        lineNumbers: true,
        theme: 'default',
        mode: 'lua',
      }}
      onChange={(editor, data, value) => { onChange ? onChange(value) : null }}
    />
  )
}

export default LuaEditor
