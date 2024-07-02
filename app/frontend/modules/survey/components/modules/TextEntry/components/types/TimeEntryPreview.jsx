import { Component } from 'react'
import { TimePicker } from 'antd'
import dayjs from '~/utils/dayjs'
import { getIn } from '~/utils/immutable'

const FORMAT = 'h:mm a'
export default class TimeEntryPreview extends Component {
  changeAnswer = (e) => {
    const { model } = this.props
    model.result.answer(e && e.format(FORMAT))
    this.forceUpdate()
  }

  render () {
    const { model: { result: { answers }, id: questionId }, errors } = this.props

    const value = getIn(answers, ['0', 'value'])

    return (
      <TimePicker
        defaultValue={value ? dayjs(value, FORMAT) : null}
        format={FORMAT}
        placeholder="HH:mm"
        onChange={this.changeAnswer}
        aria-invalid={!!errors.length}
        aria-describedby={`error-for-question-${questionId}`}
      />
    )
  }
}
