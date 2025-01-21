import React, { useState } from 'react'
import {
  Modal, DatePicker, Button, Checkbox,
  Space,
} from 'antd'
import type { RangeValue } from 'rc-picker/lib/interface'
import dayjs from '~/utils/dayjs'

interface Props {
  open: boolean;
  onCancel: () => void;
  onDownload: (startDate?: dayjs.Dayjs, endDate?: dayjs.Dayjs, includeInactiveUsers?: boolean) => void;
  dateFormat?: string
  modalTitle?:string
  showTime?: boolean
  disabledDate?: (current: dayjs.Dayjs, range: (dayjs.Dayjs | null)[]) => boolean
  initialRange?: RangeValue<dayjs.Dayjs>
}

const { I18n } = window

export const DateRangeSelectorModal: React.FC<Props> = ({
  open, onCancel, onDownload, dateFormat = 'YYYY-MM-DD HH:mm', modalTitle, showTime,
  disabledDate, initialRange,
}) => {
  const [dateRange, setDateRange] = useState<(dayjs.Dayjs | null)[]>(initialRange || [null, null])
  const [includeInactiveUsers, setIncludeInactiveUsers] = useState(false)

  const handleDownload = () => {
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
      title={modalTitle || 'Bulk Download'}
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
          value={[dateRange[0], dateRange[1]]}
          onCalendarChange={dateRange => dateRange && setDateRange(dateRange)}
          disabledDate={handleDisableDate}
          format={dateFormat}
          showTime={showTime}
          placeholder={['Start Date', 'End Date']}
          style={{ width: '100%' }}
          allowClear={false}
        />
      </Space>
    </Modal>
  )
}
