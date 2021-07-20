import React from 'react'
import Editor from '../../../../components/Editor/Editor'

export default function Form ({ elementId }) {
  const el = document.getElementById(elementId)

  const onChange = (value) => {
    const el = document.getElementById(elementId)
    el.value = value
  }

  return (
    <div className="ant-form-vertical">
      <Editor handleContentChange={onChange} content={el.value} />
    </div>
  )
}
