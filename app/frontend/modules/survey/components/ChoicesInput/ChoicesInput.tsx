import React, { FC } from 'react'
import isNumber from 'lodash/isNumber'
import isNaN from 'lodash/isNaN'
import {
  Button, Col, Input, Row,
} from 'antd'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'

const MIN_VALUE = 0
const MAX_VALUE = 500

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model?: any
  onChange: (value: number) => void
  value?: number
  minValue?: number
  maxValue?: number
  className?: string
}

const ChoicesInput: FC<Props> = ({
  model,
  onChange,
  value,
  minValue,
  maxValue,
  className,
}) => {
  const getMinValue = () => minValue || MIN_VALUE

  const getMaxValue = () => maxValue || MAX_VALUE

  const updateModel = (val) => {
    onChange && onChange(val)
  }

  const handleOnChange = (e) => {
    if (!e.currentTarget.value.match(/\D/)) {
      let value = parseInt(e.currentTarget.value, 10)
      if (isNaN(value)) {
        value = getMinValue()
      } else {
        value = value < getMaxValue() ? value : getMaxValue()
      }

      updateModel(value)
    }
  }

  const handleOnIncrement = () => {
    let val = isNumber(value) ? value : model.props.choices
    val += 1
    val = val < getMaxValue() ? val : getMaxValue()
    updateModel(val)
  }

  const handleOnDecrement = () => {
    let val = isNumber(value) ? value : model.props.choices
    val -= 1
    val = val < getMinValue() ? getMinValue() : val
    updateModel(val)
  }

  const val = isNumber(value) ? value : model.props.choices

  return (
    <Row justify="space-between" align="middle" className={className} wrap={false}>
      <Col>
        <Button onClick={handleOnDecrement} size="small">
          <MinusOutlined />
        </Button>
      </Col>
      <Col span="8">
        <Input onChange={handleOnChange} value={val} className="ta-c" size="small" />
      </Col>
      <Col>
        <Button onClick={handleOnIncrement} size="small">
          <PlusOutlined />
        </Button>
      </Col>
    </Row>
  )
}

export default ChoicesInput
