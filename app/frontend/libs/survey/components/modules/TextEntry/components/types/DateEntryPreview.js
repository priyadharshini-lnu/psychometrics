import React from 'react'
import { DatePicker } from 'antd'
import moment from 'moment'
import { getIn } from 'utils/immutable'

const FORMAT = 'YYYY-MM-DD'
export default class DateEntryPreview extends React.Component {
  changeAnswer = (e) => {
    const { model } = this.props
    model.result.answer(e && e.format(FORMAT))
    this.forceUpdate()
  }

  render () {
    const { model: { result: { answers } } } = this.props

    const value = getIn(answers, ['0', 'value'])

    return (
      <DatePicker value={value ? moment(value, FORMAT) : null} onChange={this.changeAnswer} format={FORMAT} />
    )
  }
}
