import { FC, ReactElement } from 'react'
import { Modal, Button } from 'antd'
import { CheckOutlined } from '@ant-design/icons'

const { I18n } = window

type Props = {
  title: string,
  message: string | ReactElement,
  onConfirm: () => void
  onCancel: () => void
  children?: ReactElement
}

export const ConfirmationModal: FC<Props> = ({
  title,
  message,
  onConfirm,
  onCancel,
  children,
}) => (
  <Modal
    width={580}
    title={<div>{title || I18n.t('threesixty.confirmation_required')}</div>}
    open
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
