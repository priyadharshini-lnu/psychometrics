/* eslint-disable max-len */
import React from 'react'
import {
  Button, Modal,
} from 'antd'
import './styles.scss'

export default function PrivacyModal ({
  accept, show, close,
}) {
  return (
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
          <Button type="primary" onClick={() => accept()}>
            {I18n.t('threesixty.accept_privacy_modal.accept')}
          </Button>
          <Button type="danger" onClick={() => close()}>
            {I18n.t('threesixty.accept_privacy_modal.reject')}
          </Button>
        </div>
      )}
    >
      <div className="help-modal-body" dangerouslySetInnerHTML={{ __html: I18n.t('threesixty.accept_privacy_modal.text') }} />
    </Modal>
  )
}
