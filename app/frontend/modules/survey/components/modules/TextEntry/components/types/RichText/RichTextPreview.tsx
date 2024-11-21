import { FC, useRef } from 'react'
import { Row, Col } from 'antd'

import { PreviewModel } from '~/modules/survey/interfaces/questions/TextEntry'

import Editor from './Editor'
import { characterAndWordLimit } from './characterAndWordLimit'

interface Props {
  model: PreviewModel
  readOnly: boolean
}

type RichTextEditorRef = {
  editor?: {
    wordCounter: {
      wordCount: () => number
    }
  }
}

const RichTextPreview: FC<Props> = ({
  model, readOnly,
}) => {
  const {
    result,
    props: {
      predefinedRichText,
      usePredefinedRichText,
    },
    validation,
  } = model

  const ref = useRef<RichTextEditorRef>()

  const text = (result.answers[0] && result.answers[0].value) || (usePredefinedRichText && predefinedRichText) || ''

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
            ref={ref}
            {...characterAndWordLimit(validation)}
          />
        </Col>
      </Row>
    </div>
  )
}

export default RichTextPreview
