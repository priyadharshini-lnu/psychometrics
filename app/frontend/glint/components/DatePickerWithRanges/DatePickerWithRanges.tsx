import { FC } from 'react'
import { DatePicker } from 'antd'
import { RangePickerProps } from 'antd/lib/date-picker'
import dayjs from '~/utils/dayjs'

const { I18n } = window

export const DatePickerWithRanges: FC<RangePickerProps> = ({ ranges, ...props }) => (
  <DatePicker.RangePicker
    {...props}
    ranges={{
      [I18n.t('glint.datepicker_with_ranges.today')]: [
        dayjs(), dayjs(),
      ],
      [I18n.t('glint.datepicker_with_ranges.yesterday')]: [
        dayjs().subtract(1, 'd'), dayjs().subtract(1, 'd'),
      ],
      [I18n.t('glint.datepicker_with_ranges.current_week')]: [
        dayjs().startOf('w'), dayjs().endOf('w'),
      ],
      [I18n.t('glint.datepicker_with_ranges.last_week')]: [
        dayjs().subtract(1, 'w').startOf('w'), dayjs().subtract(1, 'w').endOf('w'),
      ],
      [I18n.t('glint.datepicker_with_ranges.current_month')]: [
        dayjs().startOf('M'), dayjs().endOf('M'),
      ],
      [I18n.t('glint.datepicker_with_ranges.last_month')]: [
        dayjs().subtract(1, 'M').startOf('M'), dayjs().subtract(1, 'M').endOf('M'),
      ],
      [I18n.t('glint.datepicker_with_ranges.all_time')]: [
        dayjs().subtract(100, 'y'), dayjs().add(100, 'y'),
      ],
      ...ranges,
    }}
  />
)
