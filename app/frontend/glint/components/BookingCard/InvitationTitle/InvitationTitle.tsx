import { FC } from 'react'
import { Typography, Space } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'

import TimzoneSelect from '~/components/TimeZoneSelect'

const { Title } = Typography

type Props = {
  title: string,
  description: string,
  currentTimeZone: string,
  onTimeZoneChange: (value: string) => void
}

export const InvitationTitle:FC<Props> = ({
  title, description, currentTimeZone, onTimeZoneChange,
}) => (
  <div>
    <Title level={4}>{title}</Title>
    <Space className="w-100" direction="vertical" size="large">
      <p>{description}</p>
      <span className="text-nowrap">
        <GlobalOutlined />
        <TimzoneSelect
          value={currentTimeZone}
          onChange={onTimeZoneChange}
          bordered={false}
        />
      </span>
    </Space>
  </div>
)
