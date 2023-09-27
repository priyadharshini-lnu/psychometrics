import { FC } from 'react'
import { Row, Col } from 'antd'

import { PreviewModel } from '~/modules/survey/interfaces/questions/TextEntry'

import Editor from './Editor'

interface Props {
  model: PreviewModel
  readOnly: boolean
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
  } = model

  const text = (result.answers[0] && result.answers[0].value) || (usePredefinedRichText && predefinedRichText) || ''

  const saveContent = (text: string) => {
    model.result.answer(text)
  }

  return (
    <div>
      <Row>
        <Col>
          <Editor content={text} handleContentChange={value => saveContent(value)} readOnly={readOnly} />
        </Col>
      </Row>
    </div>
  )
}

export default RichTextPreview
