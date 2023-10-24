import { FC } from 'react'
import { Typography, Space } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { BaseType } from 'antd/lib/typography/Base'

type Props = {
  text: React.ReactElement | string
  className?: string
  textType?: BaseType | 'none'
  containerClassName?: string
}
const { Text } = Typography

export const TimerText:FC<Props> = ({
  text, className, textType = 'secondary', containerClassName,
}) => (
  text ? (
    <Space className={containerClassName}>
      <ClockCircleOutlined className={className} />
      <Text type={textType === 'none' ? undefined : textType}>{text}</Text>
    </Space>
  ) : null
)
