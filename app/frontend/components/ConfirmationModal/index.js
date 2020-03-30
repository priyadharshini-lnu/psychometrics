import React from 'react'
import { Modal, Button } from 'antd'
import { CheckOutlined } from '@ant-design/icons'

export default function ConfirmationModal ({
  title,
  message,
  onConfirm,
  onCancel,
  children,
}) {
  return (
    <Modal
      width={580}
      title={<div>{title || I18n.t('threesixty.confirmation_required')}</div>}
      visible
      onOk={onConfirm}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onConfirm}>
          <CheckOutlined />
          Confirm
        </Button>,
      ]}
    >
      <div>{message}</div>
      {children}
    </Modal>
  )
}
