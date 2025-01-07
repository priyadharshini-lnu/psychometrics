import React, { useState } from 'react'
import { Modal, DatePicker, Button } from 'antd'
import type { RangeValue } from 'rc-picker/lib/interface'
import dayjs from '~/utils/dayjs'

interface Props {
  open: boolean;
  onCancel: () => void;
  onDownload: (startDate?: dayjs.Dayjs, endDate?: dayjs.Dayjs) => void;
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

  const handleDownload = () => {
    const [startDate, endDate] = dateRange
    onDownload(startDate || undefined, endDate || undefined)
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
    </Modal>
  )
}
