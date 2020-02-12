import React, { useState } from 'react'
import Editor from 'components/Editor'
import styles from './StaticContent.scss'
import PropertyPanel from './PropertyPanel'

export default function StaticContent (props) {
  const { model, model: { props: { staticContent } }, updateBlockProps } = props
  const [opened, setOpened] = useState(true)

  const handleContentChange = (value) => {
    updateBlockProps(model, { staticContent: { ...staticContent, value } })
  }

  const iconClass = `fa fa-chevron-down ${styles.icon} ${opened ? '' : 'fa-rotate-270'}`
  return (
    <>
      <div className={styles.header}>
        <div className={styles.expander}>
          <span onClick={() => setOpened(!opened)} className={iconClass} />
          Static Content
        </div>
      </div>
      {opened && (
      <div className={styles.editorContainer}>
        <Editor
          content={model.props.staticContent.value}
          handleContentChange={handleContentChange}
          className={styles.editor}
        />
        <PropertyPanel {...props} />
      </div>
      )}
    </>
  )
}
