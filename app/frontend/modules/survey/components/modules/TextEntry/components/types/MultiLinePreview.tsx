import { ChangeEvent, FC, useState } from 'react'
import { Row, Col } from 'antd'

import { PreviewModel } from '~/modules/survey/interfaces/questions/TextEntry'

import useForceUpdate from '~/hooks/useUpdate'
import { TextEntryCounter } from '~/modules/survey/components/modules/TextEntry/components/TextEntryCounter'
import { SpeechToTextInput } from '~/modules/survey/components/modules/TextEntry/components/SpeechToTextInput'

interface Props {
  model: PreviewModel
  readOnly: boolean
  activeDictationOnQuestion: number
  setDictationActiveOnQuestion(questionId: number): void
  fetchAwsSpeechTextPresignedUrl(): Promise<{ response: { url: string } }>
}

const MultiLinePreview: FC<Props> = ({
  readOnly,
  model,
  activeDictationOnQuestion,
  setDictationActiveOnQuestion,
  fetchAwsSpeechTextPresignedUrl,
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
            >
              <MultiLineTextArea
                type={type}
                disabled={isDictating || readOnly}
                value={value}
                handleOnChange={handleOnChange}
              />
            </SpeechToTextInput>
          ) : (
            <MultiLineTextArea
              type={type}
              disabled={readOnly}
              value={value}
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
  type: string
  disabled: boolean
  value: string
  handleOnChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
}

const MultiLineTextArea: FC<MultiLineTextAreaProps> = ({
  type,
  disabled,
  handleOnChange,
  value,
}) => {
  const rows = type === 'MultiLine' ? 3 : 6

  return (
    <textarea
      autoComplete="off"
      disabled={disabled}
      rows={rows}
      className="w-100 ant-input"
      onChange={handleOnChange}
      value={value}
    />
  )
}

export default MultiLinePreview
