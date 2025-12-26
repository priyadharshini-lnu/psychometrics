import { FC, useRef } from 'react'
import { Row, Col } from 'antd'
import { useSelector } from 'react-redux'
import { PreviewModel } from '~/modules/survey/interfaces/questions/TextEntry'

import Editor from './Editor'
import { characterAndWordLimit } from './characterAndWordLimit'
import { AppStore } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  model: PreviewModel
  readOnly: boolean
  focus?: boolean
}

type RichTextEditorRef = {
  editor?: {
    wordCounter: {
      wordCount: () => number
    },
    events: {
      focus: (focus: boolean) => void
    }
  }
}

const RichTextPreview: FC<Props> = ({
  model, readOnly, focus,
}) => {
  const {
    result,
    props: {
      predefinedRichText,
      usePredefinedRichText,
      enhanceWithAIEnabled,
      allowContentCopy: allowContentCopyOnQuestion,
    },

    validation,
  } = model

  const isCopyContentEnabledOnAssessment = useSelector(
    ({ preview }: AppStore) => preview.extraOptions?.enable_copy_content,
  )

  const ref = useRef<RichTextEditorRef>()

  const text = (result.answers[0] && result.answers[0].value) || (usePredefinedRichText && predefinedRichText) || ''

  if (focus && ref.current?.editor?.events) {
    ref.current.editor.events.focus(true)
  }

  const saveContent = (text: string) => {
    model.result.setRichTextEditorAnswerWordCount(ref.current?.editor?.wordCounter.wordCount() || 0)
    model.result.answer(text)
  }

  return (
    <div>
      <Row>
        <Col>
          <Editor
            content={text}
            handleContentChange={value => saveContent(value)}
            readOnly={readOnly}
            allowContentCopyInReadOnlyMode={isCopyContentEnabledOnAssessment || allowContentCopyOnQuestion}
            ref={ref}
            enhanceWithAIEnabled={enhanceWithAIEnabled}
            {...characterAndWordLimit(validation)}
          />
        </Col>
      </Row>
    </div>
  )
}

export default RichTextPreview
