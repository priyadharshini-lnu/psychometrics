import {
  ChangeEvent, FC, useRef,
} from 'react'
import {
  Input, Row, Col, InputRef,
} from 'antd'

import { PreviewModel } from '~/modules/survey/interfaces/questions/TextEntry'

import useForceUpdate from '~/hooks/useUpdate'
import { TextEntryCounter } from '~/modules/survey/components/modules/TextEntry/components/TextEntryCounter'

interface Props {
  model: PreviewModel
  readOnly: boolean
  nextPage: () => {}
  singleQuestionFlow: boolean
  errors: string[]
  focus?: boolean
  questionTextId?: string
}

const SingleLinePreview: FC<Props> = ({
  model, readOnly, nextPage, singleQuestionFlow, errors, focus, questionTextId,
}) => {
  const inputRef = useRef<InputRef>(null)
  const forceUpdate = useForceUpdate()
  const {
    result,
    props: { type },
    id: questionId,
  } = model

  if (focus && inputRef.current) {
    inputRef.current.focus()
  }

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {
      currentTarget: { value },
    } = event

    model.result.answer(value)
    forceUpdate()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && singleQuestionFlow) {
      nextPage()
    }
  }

  const value = (result.answers[0] && result.answers[0].value) || ''
  return (
    <div>
      <Row>
        <Col span={24}>
          <Input
            aria-invalid={!!errors.length}
            aria-describedby={`error-for-question-${questionId}`}
            autoComplete="off"
            disabled={readOnly}
            onChange={handleOnChange}
            onKeyDown={handleKeyDown}
            value={value}
            type={type === 'SingleLine' ? 'text' : 'password'}
            ref={inputRef}
            aria-labelledby={questionTextId}
          />
        </Col>
      </Row>
      <TextEntryCounter model={model} />
    </div>
  )
}

export default SingleLinePreview
