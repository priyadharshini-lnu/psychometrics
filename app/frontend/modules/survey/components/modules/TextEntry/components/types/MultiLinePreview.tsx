import {
  ChangeEvent, FC, useRef, useState,
} from 'react'
import { Row, Col } from 'antd'
import { useSelector } from 'react-redux'

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
}) => {
  const {
    props: { type, allowDictation },
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
}) => {
  const rows = type === 'MultiLine' ? 3 : 6
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const enableCopyContent = useSelector(
    ({ preview }: AppStore) => preview.extraOptions?.enable_copy_content,
  )
  if (focus && inputRef.current) {
    inputRef.current.focus()
  }

  const handleCopyContentEvents = (e) => {
    !enableCopyContent && e.preventDefault()
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
      onContextMenu={handleCopyContentEvents}
      onCopy={handleCopyContentEvents}
      onCut={handleCopyContentEvents}
    />
  )
}

export default MultiLinePreview
