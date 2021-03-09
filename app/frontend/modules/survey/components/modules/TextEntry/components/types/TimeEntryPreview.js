import React from 'react'
import { TimePicker } from 'antd'
import moment from 'moment'
import { getIn } from 'utils/immutable'

const FORMAT = 'HH:mm'
export default class TimeEntryPreview extends React.Component {
  changeAnswer = (e) => {
    const { model } = this.props
    model.result.answer(e && e.format(FORMAT))
    this.forceUpdate()
  }

  render () {
    const { model: { result: { answers } } } = this.props

    const value = getIn(answers, ['0', 'value'])

    return (
      <TimePicker
        value={value ? moment(value, FORMAT) : null}
        format={FORMAT}
        disabledTime={false}
        onChange={this.changeAnswer}
        showTime={{ defaultValue: moment('00:00', 'HH:mm') }}
      />
    )
  }
}
