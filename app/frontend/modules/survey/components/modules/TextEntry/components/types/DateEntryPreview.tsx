import { FC } from 'react'
import { DatePicker } from 'antd'
import dayjs from '~/utils/dayjs'

import { PreviewModel } from '~/modules/survey/interfaces/questions/TextEntry'
import { CalendarOutlined, CloseCircleFilled } from '~/glint/icons/AccessibleIconsAntDesign'

import { getIn } from '~/utils/immutable'
import { DATE_FORMAT_OPTIONS } from '~/modules/survey/components/modules/TextEntry/constant'

interface Props {
  model: PreviewModel
  readOnly: boolean
  errors: string[]
}

const DateEntryPreview: FC<Props> = ({ model, readOnly, errors }) => {
  const {
    result: { answers },
    props: { dateFormat },
    id: questionId,
  } = model

  const handleAnswerChange = (value: dayjs.Dayjs | null) => {
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
      allowClear={{ clearIcon: <CloseCircleFilled className="grey-text" /> }}
      disabled={readOnly}
      format={dateFormat || DATE_FORMAT_OPTIONS[0].value}
      picker={pickerMode}
      value={value ? dayjs(value, dateFormat) : null}
      onChange={handleAnswerChange}
      aria-invalid={!!errors.length}
      aria-describedby={`error-for-question-${questionId}`}
      aria-labelledby={`question-text-${model.id}`}
      suffixIcon={<CalendarOutlined className="grey-text" />}
    />
  )
}

export default DateEntryPreview
