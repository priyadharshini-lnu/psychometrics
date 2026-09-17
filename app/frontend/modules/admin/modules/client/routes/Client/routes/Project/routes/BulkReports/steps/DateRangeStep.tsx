import { FC } from 'react'
import {
  Typography, Flex, DatePicker, Button,
} from 'antd'
import dayjs from '~/utils/dayjs'

const { Text } = Typography
const { I18n } = window

const DATE_FORMAT = 'YYYY-MM-DD HH:mm'

interface Preset {
  id: string
  label: string
  range: () => [dayjs.Dayjs, dayjs.Dayjs]
}

const PRESETS: Preset[] = [
  {
    id: 'last30',
    label: I18n.t('admin.bulk_reports_last_30_days'),
    range: () => [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')],
  },
  {
    id: 'last90',
    label: I18n.t('admin.bulk_reports_last_90_days'),
    range: () => [dayjs().subtract(89, 'day').startOf('day'), dayjs().endOf('day')],
  },
  {
    id: 'ytd',
    label: I18n.t('admin.bulk_reports_year_to_date'),
    range: () => [dayjs().startOf('year'), dayjs().endOf('day')],
  },
  {
    id: 'currentYear',
    label: I18n.t('admin.bulk_reports_all_of_year', { year: dayjs().year() }),
    range: () => [dayjs().startOf('year'), dayjs().endOf('year')],
  },
]

type Props = {
  startDate: string
  endDate: string
  onDateChange: (startDate: string, endDate: string) => void
}

const activePresetId = (start: string, end: string): string | null => {
  if (!start || !end) return null
  const startDj = dayjs(start, DATE_FORMAT)
  const endDj = dayjs(end, DATE_FORMAT)
  return (
    PRESETS.find((p) => {
      const [ps, pe] = p.range()
      return ps.isSame(startDj, 'minute') && pe.isSame(endDj, 'minute')
    })?.id ?? null
  )
}

const toStr = (d: dayjs.Dayjs | null | undefined): string => (d?.isValid() ? d.format(DATE_FORMAT) : '')

const ValidationNote: FC<{ start: string; end: string }> = ({ start, end }) => {
  if (!start && !end) {
    return (
      <Text type="secondary" style={{ fontSize: 12.5 }}>
        {I18n.t('admin.bulk_reports_date_range_required')}
      </Text>
    )
  }
  if (!start || !end) {
    return (
      <Text type="secondary" style={{ fontSize: 12.5 }}>
        {!start
          ? I18n.t('admin.bulk_reports_start_date_required')
          : I18n.t('admin.bulk_reports_end_date_required')}
      </Text>
    )
  }
  if (start > end) {
    return (
      <Text type="danger" style={{ fontSize: 12.5 }}>
        {I18n.t('admin.bulk_reports_invalid_date_range')}
      </Text>
    )
  }
  return (
    <Text type="secondary" style={{ fontSize: 12.5 }}>
      {I18n.t('admin.bulk_reports_date_range_summary', { start, end })}
    </Text>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 600,
  marginBottom: 6,
}

const DateRangeStep: FC<Props> = ({ startDate, endDate, onDateChange }) => {
  const currentPreset = activePresetId(startDate, endDate)
  const startValue = startDate ? dayjs(startDate, DATE_FORMAT) : null
  const endValue = endDate ? dayjs(endDate, DATE_FORMAT) : null

  const disabledDate = (current: dayjs.Dayjs): boolean => current.isAfter(dayjs().endOf('day'))

  const handlePresetClick = (preset: Preset) => {
    const [start, end] = preset.range()
    onDateChange(start.format(DATE_FORMAT), end.format(DATE_FORMAT))
  }

  const handleStartChange = (value: dayjs.Dayjs | null) => {
    onDateChange(toStr(value), endDate)
  }

  const handleEndChange = (value: dayjs.Dayjs | null) => {
    onDateChange(startDate, toStr(value))
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
        {I18n.t('admin.bulk_reports_select_date_range')}
      </Text>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 13.5 }}>
        {I18n.t('admin.bulk_reports_select_date_range_description')}
      </Text>

      <Flex gap={8} wrap="wrap" style={{ marginBottom: 20 }}>
        {PRESETS.map(preset => (
          <Button
            key={preset.id}
            type={currentPreset === preset.id ? 'primary' : 'default'}
            shape="round"
            size="small"
            onClick={() => handlePresetClick(preset)}
          >
            {preset.label}
          </Button>
        ))}
      </Flex>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          maxWidth: 520,
          marginBottom: 14,
        }}
      >
        <div>
          <label htmlFor="bulk-start-date" style={labelStyle}>
            {I18n.t('admin.dates_start')}
          </label>
          <DatePicker
            id="bulk-start-date"
            value={startValue}
            format={DATE_FORMAT}
            showTime={{ format: 'HH:mm' }}
            disabledDate={disabledDate}
            disabledTime={() => ({})}
            allowClear={false}
            placeholder={I18n.t('admin.bulk_reports_start_date_placeholder')}
            style={{ width: '100%' }}
            onChange={handleStartChange}
          />
        </div>
        <div>
          <label htmlFor="bulk-end-date" style={labelStyle}>
            {I18n.t('admin.dates_end')}
          </label>
          <DatePicker
            id="bulk-end-date"
            value={endValue}
            format={DATE_FORMAT}
            showTime={{ format: 'HH:mm' }}
            disabledDate={disabledDate}
            allowClear={false}
            placeholder={I18n.t('admin.bulk_reports_end_date_placeholder')}
            style={{ width: '100%' }}
            onChange={handleEndChange}
          />
        </div>
      </div>

      <ValidationNote start={startDate} end={endDate} />
    </div>
  )
}

export default DateRangeStep
