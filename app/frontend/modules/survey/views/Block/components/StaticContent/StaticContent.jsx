import { useState, useEffect, useRef } from 'react'
import Editor from '~/components/Editor'
import styles from './StaticContent.less'
import PropertyPanel from './PropertyPanel'
import GetBackgroundStyles from './getBackgroundStyles'
import pipedText from '~/libs/Editor/commands/pipedText'
import store from '~/modules/survey/store'

export default function StaticContent (props) {
  const {
    model,
    model: {
      props: {
        staticContent,
        staticContent: {
          backgroundColor,
          backgroundImage,
          backgroundImageOptions,
        },
      },
    }, updateBlockProps,
  } = props

  const [opened, setOpened] = useState(true)
  const editorRef = useRef(null)

  useEffect(() => {
    pipedText(store)
  }, [])

  useEffect(() => {
    const editorView = getEditorView()
    if (editorView) {
      setEditorStyles(editorView)
    } else {
      setTimeout(() => setEditorStyles(), 250)
    }
  }, [backgroundColor, backgroundImage, backgroundImageOptions])

  const setEditorStyles = (editorView) => {
    editorView = editorView || getEditorView()
    if (editorView) {
      const styles = GetBackgroundStyles.run(staticContent)

      editorView.style.backgroundColor = styles.backgroundColor
      editorView.style.backgroundImage = styles.backgroundImage
      editorView.style.backgroundSize = styles.backgroundSize
      editorView.style.backgroundRepeat = styles.backgroundRepeat
    }
  }

  const getEditorView = () => editorRef.current.getElementsByClassName('fr-view')[0]

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
      <div ref={editorRef} className={styles.editorContainer}>
        <Editor
          content={model.props.staticContent.value}
          handleContentChange={handleContentChange}
          className={styles.editor}
          withPipedText
        />
        <PropertyPanel {...props} />
      </div>
      )}
    </>
  )
}
