import React, { ChangeEvent, FC, useRef } from 'react'
import { Row, Col } from 'antd'

import useForceUpdate from 'hooks/useUpdate'
import { TextEntryCounter } from 'modules/survey/components/modules/TextEntry/components/components/TextEntryCounter'
import { SpeechToTextInput } from 'modules/survey/components/modules/TextEntry/components/components/SpeechToTextInput'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any
  readOnly: boolean
  awsSpeechTextPresignedUrl: string
  activeDictationOnQuestion: number
  setDictationActiveOnQuestion: (questionId: number) => void
}

const MultiLinePreview: FC<Props> = ({
  readOnly,
  model,
  awsSpeechTextPresignedUrl,
  activeDictationOnQuestion,
  setDictationActiveOnQuestion,
}) => {
  const {
    props: { type, allowDictation },
    id: questionId,
    result,
  } = model

  const forceUpdate = useForceUpdate()

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

  const handleDictationToggle = (isStarted: boolean) => {
    if (isStarted) {
      setDictationActiveOnQuestion(questionId)
    } else {
      setDictationActiveOnQuestion(0)
    }
  }

  const value = result?.answers?.[0]?.value ?? ''

  const isDictationDisabled = activeDictationOnQuestion !== questionId && activeDictationOnQuestion !== 0

  return (
    <div>
      <Row>
        <Col span={24}>
          {allowDictation ? (
            <SpeechToTextInput
              preSignedUrl={awsSpeechTextPresignedUrl}
              value={value}
              onChange={updateModelAnswer}
              onToggle={handleDictationToggle}
              isDisabled={isDictationDisabled || readOnly}
            >
              <MultiLineTextArea
                readOnly={readOnly}
                value={value}
                type={type}
                handleOnChange={handleOnChange}
              />
            </SpeechToTextInput>
          ) : (
            <MultiLineTextArea
              readOnly={readOnly}
              value={value}
              type={type}
              handleOnChange={handleOnChange}
            />
          )}
        </Col>
      </Row>
      <TextEntryCounter model={model} />
    </div>
  )
}

interface MultiLineTextAreaProps {
  readOnly: boolean
  value: string
  type: string
  handleOnChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
}

const MultiLineTextArea: FC<MultiLineTextAreaProps> = ({
  readOnly,
  type,
  handleOnChange,
  value,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const rows = type === 'MultiLine' ? 3 : 6
  const disabled = readOnly

  return (
    <textarea
      autoComplete="off"
      disabled={disabled}
      rows={rows}
      className="w-100 ant-input"
      onChange={handleOnChange}
      value={value}
      ref={ref}
    />
  )
}

export default MultiLinePreview
