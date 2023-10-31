import {
  Modal,
} from 'antd'

const { I18n } = window

export default function Confirm ({ open, onReset, onOk }) {
  return (
    <Modal
      title={I18n.t('anonym.notifications.restart.title')}
      open={open}
      okText={I18n.t('anonym.continue')}
      cancelText={I18n.t('anonym.restart')}
      onOk={onOk}
      onCancel={onReset}
    >
      {I18n.t('anonym.notifications.restart.copy')}
    </Modal>
  )
}
