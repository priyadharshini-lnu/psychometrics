import React, { useState, useRef, useEffect } from 'react'
import { Input } from 'antd'
import styles from './MultiInlineEditorStyle.scss'

const { TextArea } = Input

interface Props {
  value: string,
  onChange: (value: string) => void
  width?: number
}

const ESC_CODE = 27

const MultiInlineEditor: React.FC<Props> = ({ value, onChange, width }) => {
  const [edit, setEdit] = useState<boolean>(false)
  const [text, setText] = useState<string>(value)

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const textAreaRef = useRef<TextArea>(null)

  useEffect(() => {
    if (textAreaRef.current && edit) textAreaRef.current.focus()
  }, [edit])

  const handleKeyDown = ({ keyCode }): void => {
    if (keyCode === ESC_CODE) {
      setEdit(false)
      setText(value)
    }
  }

  const handleChange = ({ target }): void => {
    setText(target.value)
  }

  const handleBlur = (): void => {
    setEdit(false)
    onChange(text)
  }

  if (edit) {
    return (
      <div style={{ width }}>
        <TextArea
          ref={textAreaRef}
          autoSize
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          value={text}
          onChange={handleChange}
        />
      </div>
    )
  }

  return (
    <span className={styles.editable} onClick={(): void => setEdit(true)}>{value}</span>
  )
}

export default MultiInlineEditor
