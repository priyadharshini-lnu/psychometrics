import { Modal } from 'antd'

const Confirmation = ({
  show, title, children, onConfirm, onCancel, confirm, cancel,
}) => (
  <Modal
    open={show}
    title={title || 'Confirm'}
    keyboard={false}
    okText={confirm || 'Yes'}
    cancelText={cancel || 'No'}
    onOk={onConfirm}
    onCancel={onCancel}
    cancelButtonProps={{ type: 'primary' }}
    okButtonProps={{ danger: true }}
  >
    {children}
  </Modal>
)

export default Confirmation
