import { FC, ReactElement } from 'react'
import { Modal, Button } from 'antd'
import { CheckOutlined } from '@ant-design/icons'

const { I18n } = window

type Props = {
  title: string,
  message: string | ReactElement,
  open: boolean
  onConfirm: () => void
  onCancel?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
  children?: ReactElement
  close: () => void
}

export const ConfirmationModal: FC<Props> = ({
  title,
  message,
  open,
  onConfirm,
  onCancel,
  children,
  close,
}) => {
  const handleConfirm = () => {
    onConfirm()
    close()
  }
  const handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    onCancel && onCancel(e)
    close()
  }
  return (
    <Modal
      width={580}
      title={<div>{title || I18n.t('threesixty.confirmation_required')}</div>}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          {I18n.t('common.text.cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleConfirm}>
          <CheckOutlined />
          {I18n.t('common.text.confirm')}
        </Button>,
      ]}
    >
      <div>{message}</div>
      {children}
    </Modal>
  )
}
