import {
  InputNumber, InputNumberProps, Typography, Select,
} from 'antd'
import React from 'react'

const { Option } = Select
interface Props extends InputNumberProps<string> {
  label: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void;
}

interface PixelOrPercentSelectProps {
  value: 'px' | '%'
  onChange?: (value: PixelOrPercent) => void;
}


export type PixelOrPercent = 'px' | '%'

const PixelOrPercentSelect: React.FC<PixelOrPercentSelectProps> = ({ value, onChange }) => (
  <Select defaultValue="px" value={value} onChange={onChange} style={{ width: 60 }}>
    <Option value="px">px</Option>
    <Option value="%">%</Option>
  </Select>
)

const PropertyPixelOrPercent: React.FC<Props> = (props) => {
  const {
    label, value, defaultValue, onChange, ...rest
  } = props
  const theValue = value ?? defaultValue
  const pixelOrPercent = String(theValue).indexOf('%') >= 0 ? '%' : 'px'
  const numValue = theValue ? theValue.replace(/[^0-9]/g, '') : null
  const onChangeValue = (value) => {
    if (!onChange) return
    if (!value) {
      onChange('')
    } else {
      onChange(`${value}${pixelOrPercent}`)
    }
  }
  const onChangeSuffix = (pixelOrPercent) => {
    if (!onChange) return
    if (!numValue) {
      onChange('')
    } else {
      onChange(`${numValue}${pixelOrPercent}`)
    }
  }
  return (
    <>
      <Typography.Text>{label}</Typography.Text>
      <InputNumber
        {...rest}
        value={numValue ?? undefined}
        onChange={value => onChangeValue(value)}
        addonAfter={<PixelOrPercentSelect value={pixelOrPercent} onChange={onChangeSuffix} />}
      />
    </>
  )
}

export default PropertyPixelOrPercent
