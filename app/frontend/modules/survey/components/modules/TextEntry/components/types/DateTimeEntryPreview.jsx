import { Component } from 'react'
import { DatePicker } from 'antd'
import dayjs from '~/utils/dayjs'
import { getIn } from '~/utils/immutable'

const FORMAT = 'YYYY-MM-DD HH:mm:ss'
export default class DateTimeEntryPreview extends Component {
  changeAnswer = (e) => {
    const { model } = this.props
    model.result.answer(e && e.format(FORMAT))
    this.forceUpdate()
  }

  render () {
    const { model: { result: { answers }, id: questionId }, errors } = this.props

    const value = getIn(answers, ['0', 'value'])

    return (
      <DatePicker
        value={value ? dayjs(value, FORMAT) : null}
        format={FORMAT}
        disabledTime={false}
        onChange={this.changeAnswer}
        showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
        aria-invalid={!!errors.length}
        aria-describedby={`error-for-question-${questionId}`}
      />
    )
  }
}
