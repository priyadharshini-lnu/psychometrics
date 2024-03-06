import { FC, useState, useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { isRtl } from '~/utils/locales'
import { updateInstructionsContent } from '~/modules/survey/core/builder/assessment/actions'
import Editor from '~/components/Editor'
import styles from './Instructions.less'

const { I18n } = window

type Props = ConnectedProps<typeof connector>

const Instructions: FC<Props> = (props) => {
  const {
    instructions,
    defaultLanguage,
    updateInstructionsContent,
  } = props

  if (!instructions.enabled) { return null }
  const [opened, setOpened] = useState(true)
  const editorRef = useRef(null)

  const iconClass = `fa fa-chevron-down ${styles.icon} ${opened ? '' : 'fa-rotate-270'}`
  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <div className={styles.expander}>
          <span onClick={() => setOpened(!opened)} className={iconClass} />
          {I18n.t('assessments.instructions.title')}
        </div>
      </div>
      <div className={styles.content} style={{ display: opened ? 'block' : 'none' }}>
        <div ref={editorRef} className={styles.editorContainer}>
          <Editor
            content={instructions.content}
            handleContentChange={updateInstructionsContent}
            className={styles.editor}
            configOverrides={{
              direction: isRtl(defaultLanguage) ? 'rtl' : 'ltr',
            }}
            withPipedText
          />
        </div>
      </div>
    </div>
  )
}

const connector = connect(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ survey: { builder: { assessment: { instructions, defaultLanguage } } } }: any) => ({
    instructions,
    defaultLanguage,
  }),
  { updateInstructionsContent },
)

export default connector(Instructions)
