import { DatePicker } from 'antd'
import dayjs from '~/utils/dayjs'

export default function DateTimeEntry () {
  return (
    <DatePicker
      size="default"
      format="YYYY-MM-DD HH:mm:ss"
      showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
    />
  )
}
