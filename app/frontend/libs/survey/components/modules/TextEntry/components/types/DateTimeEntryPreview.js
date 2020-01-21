import React from 'react'
import { DatePicker } from 'antd'
import moment from 'moment'

const FORMAT = 'YYYY-MM-DD HH:mm:ss'
export default class DateTimeEntryPreview extends React.Component {
  changeAnswer = (e) => {
    const { model } = this.props
    model.result.answer(e && e.format(FORMAT))
    this.forceUpdate()
  }

  render () {
    return (
      <DatePicker
        format={FORMAT}
        disabledTime={false}
        onChange={this.changeAnswer}
        showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
      />
    )
  }
}
