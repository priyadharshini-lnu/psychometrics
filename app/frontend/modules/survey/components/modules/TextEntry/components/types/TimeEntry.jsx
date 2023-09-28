import { TimePicker } from 'antd'
import moment from 'moment'

export default function TimeEntry () {
  return (
    <TimePicker
      format="h:mm a"
      placeholder="HH:mm"
      defaultValue={moment('12:00 am', 'h:mm a')}
    />
  )
}
