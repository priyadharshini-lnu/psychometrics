import React, { useState } from 'react'
import {
  Modal, DatePicker, Button, Checkbox,
  Space,
} from 'antd'
import { RangeValueType } from '~/interfaces/Antd'
import dayjs from '~/utils/dayjs'

interface Props {
  open: boolean;
  onCancel: () => void;
  onDownload: (startDate?: dayjs.Dayjs, endDate?: dayjs.Dayjs, includeInactiveUsers?: boolean) => void;
  dateFormat?: string
  modalTitle?:string
  showTime?: boolean
  disabledDate?: (current: dayjs.Dayjs, range: RangeValueType) => boolean
  initialRange?: RangeValueType
}

const { I18n } = window

export const DateRangeSelectorModal: React.FC<Props> = ({
  open, onCancel, onDownload, dateFormat = 'YYYY-MM-DD HH:mm', modalTitle, showTime,
  disabledDate, initialRange,
}) => {
  const [dateRange, setDateRange] = useState<RangeValueType>(initialRange || [null, null])
  const [includeInactiveUsers, setIncludeInactiveUsers] = useState(false)

  const handleDownload = () => {
    if (!dateRange) return
    const [startDate, endDate] = dateRange
    onDownload(startDate || undefined, endDate || undefined, includeInactiveUsers)
    resetDates()
  }

  const handleCancel = () => {
    resetDates()
    onCancel()
  }

  const resetDates = () => {
    setDateRange([null, null])
  }

  const disabledFutureDate = (current: dayjs.Dayjs): boolean => {
    const today = dayjs().endOf('day')
    if (current > today) return true
    return false
  }

  const handleDisableDate = (current: dayjs.Dayjs): boolean => {
    if (disabledDate) {
      return disabledDate(current, dateRange)
    }

    return disabledFutureDate(current)
  }

  return (
    <Modal
      title={modalTitle || I18n.t('campaign_report.actions.bulk_download')}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button key="download" type="primary" onClick={handleDownload}>
          {I18n.t('common.actions.export')}
        </Button>,
      ]}
      destroyOnClose
    >
      <Space direction="vertical" size={16} className="mt-4">
        <Checkbox
          onChange={({ target: { checked } }) => { setIncludeInactiveUsers(checked) }}
          checked={includeInactiveUsers}
        >
          {I18n.t('user.modals.exports.include_inactive_users')}
        </Checkbox>
        <DatePicker.RangePicker
          value={dateRange}
          onCalendarChange={dateRange => dateRange && setDateRange(dateRange)}
          disabledDate={handleDisableDate}
          format={dateFormat}
          showTime={showTime}
          placeholder={[I18n.t('glint.schedule_availability.start_date'),
            I18n.t('glint.schedule_availability.end_date')]}
          style={{ width: '100%' }}
          allowClear={false}
        />
      </Space>
    </Modal>
  )
}
