import React, { FC } from 'react'
import { DatePicker } from 'antd'

import { BuilderModel } from 'modules/survey/interfaces/questions/TextEntry'

import { DATE_FORMAT_OPTIONS } from 'modules/survey/components/modules/TextEntry/constant'
import { getCorrectPickerFromDateFormat } from 'modules/survey/utils/date'

interface Props {
  format: BuilderModel['props']['dateFormat']
}

const DateEntry: FC<Props> = ({ format }) => {
  const dateFormat = format || DATE_FORMAT_OPTIONS[0].value

  return (
    <DatePicker
      size="middle"
      format={dateFormat}
      picker={getCorrectPickerFromDateFormat(dateFormat)}
    />
  )
}

export default DateEntry
