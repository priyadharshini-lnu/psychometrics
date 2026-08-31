import {
  ChangeEvent, FC, useRef,
} from 'react'
import {
  Input, Row, Col, InputRef,
} from 'antd'
import { useSelector } from 'react-redux'
import { AIInput } from '~/components/AIToolbar'

import { PreviewModel } from '~/modules/survey/interfaces/questions/TextEntry'

import useForceUpdate from '~/hooks/useUpdate'
import { TextEntryCounter } from '~/modules/survey/components/modules/TextEntry/components/TextEntryCounter'
import { AppStore } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  model: PreviewModel
  readOnly: boolean
  nextPage: () => {}
  singleQuestionFlow: boolean
  errors: string[]
  focus?: boolean
  questionTextId?: string
  showEnhanceWithAI?: boolean
}

const SingleLinePreview: FC<Props> = ({
  model, readOnly, nextPage, singleQuestionFlow, errors, focus, questionTextId, showEnhanceWithAI = false,
}) => {
  const inputRef = useRef<InputRef>(null)
  const forceUpdate = useForceUpdate()
  const isCopyContentEnabledOnAssessment = useSelector(
    ({ preview }: AppStore) => preview.extraOptions?.enable_copy_content,
  )
  const {
    result,
    props: { type, allowContentCopy: allowContentCopyOnQuestion, enhanceWithAIEnabled = true },
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

  const handleCopyContentEvents = (e) => {
    if (!isCopyContentEnabledOnAssessment && !allowContentCopyOnQuestion) {
      e.preventDefault()
    }
  }

  const handleConextMenu = (e) => {
    if (!isCopyContentEnabledOnAssessment) {
      e.preventDefault()
    }
  }

  const value = (result.answers[0] && result.answers[0].value) || ''
  return (
    <div>
      <Row>
        <Col span={24}>
          {enhanceWithAIEnabled && showEnhanceWithAI ? (
            <AIInput
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
              onContextMenu={handleConextMenu}
              onCopy={handleCopyContentEvents}
              onCut={handleCopyContentEvents}
            />
          ) : (
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
              onContextMenu={handleConextMenu}
              onCopy={handleCopyContentEvents}
              onCut={handleCopyContentEvents}
              className="spellcheck-enabled"
            />
          )}
        </Col>
      </Row>
      <TextEntryCounter model={model} />
    </div>
  )
}

export default SingleLinePreview
