import React from 'react'
import { DatePicker } from 'antd'

const FORMAT = 'YYYY-MM-DD'
export default class DateEntryPreview extends React.Component {
  changeAnswer = (e) => {
    const { model } = this.props
    model.result.answer(e && e.format(FORMAT))
    this.forceUpdate()
  }

  render () {
    return (
      <DatePicker onChange={this.changeAnswer} format={FORMAT} />
    )
  }
}
