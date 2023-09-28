import { FC } from 'react'
import isNumber from 'lodash/isNumber'
import isNaN from 'lodash/isNaN'
import {
  Button, Col, Input, Row,
} from 'antd'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'

import { BasePropertiesModel } from '~/modules/survey/interfaces/questions/Base'

const MIN_VALUE = 0
const MAX_VALUE = 500

interface Props {
  model?: BasePropertiesModel
  onChange: (value: number, undo?: boolean) => void
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

  const handleOnChange = (e) => {
    if (!e.currentTarget.value.match(/\D/)) {
      let value = parseInt(e.currentTarget.value, 10)
      if (isNaN(value)) {
        value = getMinValue()
      } else {
        value = value < getMaxValue() ? value : getMaxValue()
      }

      onChange(value)
    }
  }

  const handleOnIncrement = () => {
    let val = isNumber(value) ? value : model?.props?.choices
    if (typeof val !== 'undefined') {
      val += 1
      val = val < getMaxValue() ? val : getMaxValue()
      onChange(val)
    }
  }

  const handleOnDecrement = () => {
    let val = isNumber(value) ? value : model?.props?.choices
    if (val) {
      val -= 1
      val = val < getMinValue() ? getMinValue() : val

      onChange(val)
    }
  }

  const val = isNumber(value) ? value : model?.props?.choices

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
