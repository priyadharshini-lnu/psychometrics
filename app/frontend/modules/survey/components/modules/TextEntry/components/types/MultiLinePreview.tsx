import {
  ChangeEvent, FC, useEffect, useRef, useState,
} from 'react'
import { Row, Col } from 'antd'
import type { TextAreaRef } from 'antd/es/input/TextArea'
import { useSelector } from 'react-redux'
import { AITextArea } from '~/components/AIToolbar'

import { PreviewModel } from '~/modules/survey/interfaces/questions/TextEntry'

import useForceUpdate from '~/hooks/useUpdate'
import { TextEntryCounter } from '~/modules/survey/components/modules/TextEntry/components/TextEntryCounter'
import { SpeechToTextInput } from '~/modules/survey/components/modules/TextEntry/components/SpeechToTextInput'
import { AppStore } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  model: PreviewModel
  readOnly: boolean
  activeDictationOnQuestion: number
  setDictationActiveOnQuestion(questionId: number): void
  fetchAwsSpeechTextPresignedUrl(): Promise<{ response: { url: string } }>
  errors: string[]
  focus?: boolean
  questionTextId: string
  showEnhanceWithAI?: boolean
}

const MultiLinePreview: FC<Props> = ({
  readOnly,
  model,
  activeDictationOnQuestion,
  setDictationActiveOnQuestion,
  fetchAwsSpeechTextPresignedUrl,
  errors,
  focus,
  questionTextId,
  showEnhanceWithAI,
}) => {
  const {
    props: {
      type, allowDictation, allowContentCopy: allowContentCopyOnQuestion, enhanceWithAIEnabled = true,
    },
    id: questionId,
    result,
  } = model

  const forceUpdate = useForceUpdate()

  const [isDictating, setDictation] = useState(false)

  const updateModelAnswer = (value: string) => {
    model.result.answer(value)
    forceUpdate()
  }

  const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const {
      currentTarget: { value },
    } = event

    updateModelAnswer(value)
  }

  const handleDictationChange = (isStarted: boolean) => {
    if (isStarted) {
      setDictationActiveOnQuestion(questionId)
      setDictation(true)
    } else {
      setDictationActiveOnQuestion(0)
      setDictation(false)
    }
  }

  const value = result?.answers?.[0]?.value ?? ''

  const isDictationDisabled = (activeDictationOnQuestion !== questionId
      && activeDictationOnQuestion !== 0)
    || readOnly

  return (
    <div>
      <Row>
        <Col span={24}>
          {!readOnly && allowDictation ? (
            <SpeechToTextInput
              isDisabled={isDictationDisabled}
              value={value}
              onValueChange={updateModelAnswer}
              onDictationChange={handleDictationChange}
              fetchPresignUrl={fetchAwsSpeechTextPresignedUrl}
              tooltipId={`speechtotext-id-${model.id}`}
            >
              <MultiLineTextArea
                type={type}
                disabled={isDictating || readOnly}
                value={value}
                handleOnChange={handleOnChange}
                errors={errors}
                questionId={questionId}
                focus={focus}
                questionTextId={questionTextId}
                allowContentCopyOnQuestion={allowContentCopyOnQuestion}
                enhanceWithAIEnabled={enhanceWithAIEnabled}
                showEnhanceWithAI={showEnhanceWithAI}
              />
            </SpeechToTextInput>
          ) : (
            <MultiLineTextArea
              type={type}
              disabled={readOnly}
              value={value}
              handleOnChange={handleOnChange}
              errors={errors}
              questionId={questionId}
              focus={focus}
              questionTextId={questionTextId}
              allowContentCopyOnQuestion={allowContentCopyOnQuestion}
              enhanceWithAIEnabled={enhanceWithAIEnabled}
              showEnhanceWithAI={showEnhanceWithAI}
            />
          )}
        </Col>
      </Row>
      <TextEntryCounter model={model} />
    </div>
  )
}

interface MultiLineTextAreaProps {
  type: string
  disabled: boolean
  value: string
  handleOnChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  errors: string[]
  questionId: number
  focus?:boolean
  questionTextId: string
  allowContentCopyOnQuestion?: boolean
  enhanceWithAIEnabled?: boolean
  showEnhanceWithAI?: boolean
}

const MultiLineTextArea: FC<MultiLineTextAreaProps> = ({
  type,
  disabled,
  handleOnChange,
  value,
  errors,
  questionId,
  focus,
  questionTextId,
  allowContentCopyOnQuestion,
  enhanceWithAIEnabled,
  showEnhanceWithAI = false,
}) => {
  const rows = type === 'MultiLine' ? 3 : 6
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const aiInputRef = useRef<TextAreaRef>(null)
  const isCopyContentEnabledOnAssessment = useSelector(
    ({ preview }: AppStore) => preview.extraOptions?.enable_copy_content,
  )
  useEffect(() => {
    if (!focus) return
    // only one of the two branches below is mounted at a time
    inputRef.current?.focus()
    aiInputRef.current?.focus()
  }, [focus])

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

  if (enhanceWithAIEnabled && showEnhanceWithAI) {
    return (
      <AITextArea
        aria-invalid={!!errors.length}
        autoComplete="off"
        aria-describedby={`error-for-question-${questionId}`}
        disabled={disabled}
        rows={rows}
        className="w-100 ant-input"
        onChange={handleOnChange}
        value={value}
        id={`question-${questionId}`}
        ref={aiInputRef}
        aria-labelledby={questionTextId}
        onContextMenu={handleConextMenu}
        onCopy={handleCopyContentEvents}
        onCut={handleCopyContentEvents}
      />
    )
  }

  return (
    <textarea
      aria-invalid={!!errors.length}
      autoComplete="off"
      aria-describedby={`error-for-question-${questionId}`}
      disabled={disabled}
      rows={rows}
      className="w-100 ant-input"
      onChange={handleOnChange}
      value={value}
      id={`question-${questionId}`}
      ref={inputRef}
      aria-labelledby={questionTextId}
      onContextMenu={handleConextMenu}
      onCopy={handleCopyContentEvents}
      onCut={handleCopyContentEvents}
    />
  )
}

export default MultiLinePreview
