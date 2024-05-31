import React from 'react'
import { Typography } from 'antd'
import dayjs from '~/utils/dayjs'

type DateTimeWithZoneProps = {
  dateString: string
  format?: string
}

const DEFAULT_FORMAT = 'Do MMM YYYY, h:mm a'

export const DateTimeWithZone:React.FC<DateTimeWithZoneProps> = ({ dateString, format }) => {
  const dateFormat = format || DEFAULT_FORMAT
  const dayjsDate = dayjs(dateString)

  return (
    <Typography.Text>
      {dayjsDate.format(dateFormat)}
      <Typography.Text type="secondary">
        {dayjsDate.format(' (z)')}
      </Typography.Text>
    </Typography.Text>
  )
}
