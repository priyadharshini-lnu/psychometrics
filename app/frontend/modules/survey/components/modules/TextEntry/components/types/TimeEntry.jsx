import { TimePicker } from 'antd'
import dayjs from '~/utils/dayjs'

export default function TimeEntry () {
  return (
    <TimePicker
      format="h:mm a"
      placeholder="HH:mm"
      defaultValue={dayjs('12:00 am', 'h:mm a')}
    />
  )
}
