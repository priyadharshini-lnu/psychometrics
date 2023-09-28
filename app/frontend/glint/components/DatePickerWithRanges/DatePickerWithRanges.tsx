import { FC } from 'react'
import moment from 'moment'
import { DatePicker } from 'antd'
import { RangePickerProps } from 'antd/lib/date-picker'

const { I18n } = window

export const DatePickerWithRanges: FC<RangePickerProps> = ({ ranges, ...props }) => (
  <DatePicker.RangePicker
    {...props}
    ranges={{
      [I18n.t('glint.datepicker_with_ranges.today')]: [
        moment(), moment(),
      ],
      [I18n.t('glint.datepicker_with_ranges.yesterday')]: [
        moment().subtract(1, 'd'), moment().subtract(1, 'd'),
      ],
      [I18n.t('glint.datepicker_with_ranges.current_week')]: [
        moment().startOf('w'), moment().endOf('w'),
      ],
      [I18n.t('glint.datepicker_with_ranges.last_week')]: [
        moment().subtract(1, 'w').startOf('w'), moment().subtract(1, 'w').endOf('w'),
      ],
      [I18n.t('glint.datepicker_with_ranges.current_month')]: [
        moment().startOf('M'), moment().endOf('M'),
      ],
      [I18n.t('glint.datepicker_with_ranges.last_month')]: [
        moment().subtract(1, 'M').startOf('M'), moment().subtract(1, 'M').endOf('M'),
      ],
      [I18n.t('glint.datepicker_with_ranges.all_time')]: [
        moment().subtract(100, 'y'), moment().add(100, 'y'),
      ],
      ...ranges,
    }}
  />
)
