import React, { useState } from 'react'
import { Modal, DatePicker, Button } from 'antd'
import dayjs from '~/utils/dayjs'

interface Props {
  visible: boolean;
  onCancel: () => void;
  onDownload: (startDate?: Date, endDate?: Date) => void;
}

const format = 'YYYY-MM-DD HH:mm'

const BulkDownloadModal: React.FC<Props> = ({ visible, onCancel, onDownload }) => {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const handleDownload = () => {
    onDownload(startDate || undefined, endDate || undefined)
    resetDates()
  }

  const handleCancel = () => {
    resetDates()
    onCancel()
  }

  const resetDates = () => {
    setStartDate(null)
    setEndDate(null)
  }

  const disabledStartDate = (current: dayjs.Dayjs): boolean => {
    const today = dayjs().endOf('day')
    if (current > today) return true
    if (endDate && current > dayjs(endDate)) return true
    return false
  }

  const disabledEndDate = (current: dayjs.Dayjs): boolean => {
    const today = dayjs().endOf('day')
    if (current > today) return true
    if (startDate && current < dayjs(startDate)) return true
    return false
  }

  return (
    <Modal
      title="Bulk Download"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="download" type="primary" onClick={handleDownload}>
          Download
        </Button>,
      ]}
    >
      <DatePicker
        value={startDate ? dayjs(startDate) : null}
        onChange={date => setStartDate(date ? date.toDate() : null)}
        placeholder="Start Date"
        style={{ marginBottom: '16px', width: '100%' }}
        disabledDate={disabledStartDate}
        showTime
        format={format}
      />
      <DatePicker
        value={endDate ? dayjs(endDate) : null}
        onChange={date => setEndDate(date ? date.toDate() : null)}
        placeholder="End Date"
        style={{ width: '100%' }}
        disabledDate={disabledEndDate}
        showTime
        format={format}
      />
    </Modal>
  )
}

export default BulkDownloadModal
