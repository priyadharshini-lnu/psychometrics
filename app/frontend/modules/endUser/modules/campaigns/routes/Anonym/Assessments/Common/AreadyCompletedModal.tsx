import {
  Modal,
} from 'antd'

const { I18n } = window

export default function Confirm ({ open, onRetake, onCancel }) {
  return (
    <Modal
      title={I18n.t('anonym.notifications.retake.title')}
      open={open}
      okText={I18n.t('anonym.retake')}
      onOk={onRetake}
      cancelText={I18n.t('anonym.close')}
      onCancel={onCancel}
    >
      {I18n.t('anonym.notifications.retake.copy')}
    </Modal>
  )
}
