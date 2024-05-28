import React, { useState } from 'react'
import { Modal, DatePicker, Button } from 'antd'
import dayjs from '~/utils/dayjs'

interface Props {
  visible: boolean;
  onCancel: () => void;
  onDownload: (startDate?: Date, endDate?: Date) => void;
}

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

  return (
    <Modal
      title="Bulk Download"
      visible={visible}
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
      />
      <DatePicker
        value={endDate ? dayjs(endDate) : null}
        onChange={date => setEndDate(date ? date.toDate() : null)}
        placeholder="End Date"
        style={{ width: '100%' }}
      />
    </Modal>
  )
}

export default BulkDownloadModal
