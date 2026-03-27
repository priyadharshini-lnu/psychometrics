import {
  InputNumber, InputNumberProps, Space, Typography,
} from 'antd'
import React from 'react'
import cs from 'classnames'
import styles from './styles.less'

interface Props extends InputNumberProps {
  label: string
}

const PropertyNumber: React.FC<Props> = (props) => {
  const { label, ...rest } = props
  return (
    <Space>
      <Typography.Text className={cs(styles.label)}>{label}</Typography.Text>
      <InputNumber {...rest} />
    </Space>
  )
}

export default PropertyNumber
