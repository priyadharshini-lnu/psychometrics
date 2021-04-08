import React, { ChangeEvent, FC } from 'react'
import { Input, Row, Col } from 'antd'

import useForceUpdate from 'hooks/useUpdate'
import { TextEntryCounter } from 'modules/survey/components/modules/TextEntry/components/components/TextEntryCounter'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any
  readOnly: boolean
}

const SingleLinePreview: FC<Props> = ({ model, readOnly }) => {
  const forceUpdate = useForceUpdate()

  const {
    result,
    props: { type },
  } = model

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {
      currentTarget: { value },
    } = event

    model.result.answer(value)
    forceUpdate()
  }

  const value = (result.answers[0] && result.answers[0].value) || ''
  return (
    <div>
      <Row>
        <Col span={24}>
          <Input
            autoComplete="off"
            disabled={readOnly}
            onChange={handleOnChange}
            value={value}
            type={type === 'SingleLine' ? 'text' : 'password'}
          />
        </Col>
      </Row>
      <TextEntryCounter model={model} />
    </div>
  )
}

export default SingleLinePreview
