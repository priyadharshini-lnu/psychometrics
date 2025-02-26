import { FC } from 'react'
import { Typography, Space } from 'antd'
import { BaseType } from 'antd/lib/typography/Base'
import { ClockCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

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
