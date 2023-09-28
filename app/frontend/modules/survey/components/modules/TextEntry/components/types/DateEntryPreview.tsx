import { FC } from 'react'
import { DatePicker } from 'antd'
import moment, { Moment } from 'moment'

import { PreviewModel } from '~/modules/survey/interfaces/questions/TextEntry'

import { getIn } from '~/utils/immutable'
import { DATE_FORMAT_OPTIONS } from '~/modules/survey/components/modules/TextEntry/constant'

interface Props {
  model: PreviewModel
  readOnly: boolean
}

const DateEntryPreview: FC<Props> = ({ model, readOnly }) => {
  const {
    result: { answers },
    props: { dateFormat },
  } = model

  const handleAnswerChange = (value: Moment | null) => {
    if (value) {
      model.result.answer(value.format(dateFormat))
    } else {
      model.result.answer(null)
    }
  }

  const value = getIn(answers, ['0', 'value'])
  const pickerMode = DATE_FORMAT_OPTIONS.find(
    dateFormatOption => dateFormatOption.value === dateFormat,
  )?.picker ?? 'date'

  return (
    <DatePicker
      allowClear
      disabled={readOnly}
      format={dateFormat || DATE_FORMAT_OPTIONS[0].value}
      picker={pickerMode}
      value={value ? moment(value, dateFormat) : null}
      onChange={handleAnswerChange}
    />
  )
}

export default DateEntryPreview
