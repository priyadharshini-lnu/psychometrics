import React from 'react'
import { Modal, Button, Icon } from 'antd'

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
          <Icon type="check" />
          Confirm
        </Button>,
      ]}
    >
      <div>{message}</div>
      {children}
    </Modal>
  )
}
