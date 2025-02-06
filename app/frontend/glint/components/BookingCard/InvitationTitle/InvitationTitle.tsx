import { FC } from 'react'
import { Typography, Space } from 'antd'
import { GlobalOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import TimzoneSelect from '~/components/TimeZoneSelect'

const { Title } = Typography
const { I18n } = window

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
        <GlobalOutlined className="pe-1" />
        <TimzoneSelect
          aria-description={currentTimeZone}
          value={currentTimeZone}
          onChange={onTimeZoneChange}
          aria-label={I18n.t('glint.booking_card.aria_timezone_select')}
        />
      </span>
    </Space>
  </div>
)
