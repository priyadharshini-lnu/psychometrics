import {
  FC, useEffect, useRef, useState,
} from 'react'
import { DatePicker } from 'antd'
import cs from 'classnames'
import dayjs from '~/utils/dayjs'

import { PreviewModel } from '~/modules/survey/interfaces/questions/TextEntry'
import { CalendarOutlined, CloseCircleFilled } from '~/glint/icons/AccessibleIconsAntDesign'

import { getIn } from '~/utils/immutable'
import { DATE_FORMAT_OPTIONS } from '~/modules/survey/components/modules/TextEntry/constant'

import styles from './DateEntryPreview.less'

interface Props {
  model: PreviewModel
  readOnly: boolean
  errors: string[]
  questionTextId: string
}

const { I18n } = window

const DateEntryPreview: FC<Props> = ({
  model, readOnly, errors, questionTextId,
}) => {
  const {
    result: { answers },
    props: { dateFormat },
    id: questionId,
  } = model

  const [openPanel, setOpenPanel] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const clearIconRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const panelNode = panelRef.current?.parentNode as HTMLDivElement
    const clearIconNode = clearIconRef.current?.parentNode as HTMLSpanElement

    if (panelNode && openPanel && panelNode.getAttribute('role') !== 'dialog') {
      panelNode.setAttribute('role', 'dialog')
      panelNode.ariaModal = 'false'
      panelNode.ariaLabel = I18n.t('frontend.aria.calendar')
    }
    if (clearIconNode && clearIconNode.tabIndex !== 0) {
      clearIconNode.ariaLabel = I18n.t('frontend.aria.clear_date')
      clearIconNode.tabIndex = 0
      clearIconNode.addEventListener('keyup', clearDateSelection)
    }

    return () => {
      clearIconNode?.removeEventListener('click', clearDateSelection)
    }
  }, [openPanel])

  const handleAnswerChange = (value: dayjs.Dayjs | null) => {
    if (value) {
      model.result.answer(value.format(dateFormat))
    } else {
      model.result.answer(null)
    }
  }

  const clearDateSelection = (key) => {
    key.code === 'Enter' && handleAnswerChange(null)
  }

  const value = getIn(answers, ['0', 'value'])
  const pickerMode = DATE_FORMAT_OPTIONS.find(
    dateFormatOption => dateFormatOption.value === dateFormat,
  )?.picker ?? 'date'

  const dataFormatLabelId = `date-format-${questionId}`
  const format = dateFormat || DATE_FORMAT_OPTIONS[0].value
  const dateValue = value ? dayjs(value, dateFormat) : null

  return (
    <div>
      <span id={dataFormatLabelId} className="sr-only">{`(${format})`}</span>
      <DatePicker
        allowClear={{
          clearIcon: (
            <span ref={clearIconRef}>
              <CloseCircleFilled
                className={cs(styles.clearDate, 'grey-border')}
              />
            </span>),
        }}
        disabled={readOnly}
        format={format}
        picker={pickerMode}
        value={dateValue}
        onChange={handleAnswerChange}
        aria-invalid={!!errors.length}
        aria-describedby={`error-for-question-${questionId}`}
        aria-labelledby={`${questionTextId} ${dataFormatLabelId}`}
        suffixIcon={<CalendarOutlined aria-label="calendar" className="grey-border" />}
        panelRender={originalPanel => (
          <div
            className={cs({ [styles.noDateSelected]: !dateValue })}
            ref={panelRef}
          >
            {originalPanel}
          </div>
        )}
        onOpenChange={(open) => { setOpenPanel(open) }}
      />
    </div>

  )
}

export default DateEntryPreview
