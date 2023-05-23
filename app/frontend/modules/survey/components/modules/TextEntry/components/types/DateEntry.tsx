import { FC } from 'react'
import { DatePicker } from 'antd'

import { BuilderModel } from '~/modules/survey/interfaces/questions/TextEntry'

import { DATE_FORMAT_OPTIONS } from '~/modules/survey/components/modules/TextEntry/constant'

interface Props {
  format: BuilderModel['props']['dateFormat']
}

const DateEntry: FC<Props> = ({ format }) => {
  const dateFormat = format || DATE_FORMAT_OPTIONS[0].value
  const pickerMode = DATE_FORMAT_OPTIONS.find(
    dateFormatOption => dateFormatOption.value === dateFormat,
  )?.picker ?? 'date'

  return (
    <DatePicker
      size="middle"
      format={dateFormat}
      picker={pickerMode}
    />
  )
}

export default DateEntry
