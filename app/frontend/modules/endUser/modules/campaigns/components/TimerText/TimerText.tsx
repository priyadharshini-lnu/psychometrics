import { FC } from 'react'
import { Typography, Space } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { BaseType } from 'antd/lib/typography/Base'

type Props = {
  text: React.ReactElement | string
  className?: string
  textType?: BaseType | 'none'
}
const { Text } = Typography

export const TimerText:FC<Props> = ({ text, className, textType = 'secondary' }) => (
  text ? (
    <Space>
      <ClockCircleOutlined className={className} />
      <Text type={textType === 'none' ? undefined : textType}>{text}</Text>
    </Space>
  ) : null
)
