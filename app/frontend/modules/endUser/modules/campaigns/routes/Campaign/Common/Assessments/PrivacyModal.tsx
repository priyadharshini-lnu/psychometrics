import React, { FC, MouseEventHandler } from 'react'
import {
  Button, Modal,
} from 'antd'
import { SafeHTML } from 'components/SafeHTML'

const { I18n } = window

type PrivacyModalProps = {
  accept: MouseEventHandler<HTMLElement>,
  show: boolean,
  close: MouseEventHandler<HTMLElement>,
}

export const PrivacyModal: FC<PrivacyModalProps> = ({
  accept, show, close,
}) => (
  <Modal
    title={(
      <div className="help-modal-header">
        {I18n.t('threesixty.accept_privacy_modal.title')}
      </div>
      )}
    visible={show}
    onCancel={close}
    footer={(
      <div>
        <Button type="primary" onClick={accept}>
          {I18n.t('threesixty.accept_privacy_modal.accept')}
        </Button>
        <Button danger onClick={close}>
          {I18n.t('threesixty.accept_privacy_modal.reject')}
        </Button>
      </div>
      )}
  >
    <SafeHTML html={I18n.t('threesixty.accept_privacy_modal.text')} />
  </Modal>
)
