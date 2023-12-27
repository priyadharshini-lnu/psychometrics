import React, { useState } from 'react'
import {
  Button, Modal, Checkbox,
} from 'antd'

const { I18n } = window


interface OwnProps {
  campaignId: number
  exportUsers: (campaignId: number, params: { exportSignInUrl: boolean }) => Promise<void>
  close(): void
}

export const ExportUsersModal: React.FC<OwnProps> = ({
  close,
  campaignId,
  exportUsers,
}) => {
  const [exportSignInUrl, setexportSignInUrl] = useState(false)
  const [exportInProgress, setExportInProgress] = useState(false)

  const handleExportUsers = () => {
    setExportInProgress(true)
    exportUsers(campaignId, { exportSignInUrl }).then(() => {
      setExportInProgress(false)
      close()
    })
  }

  return (
    <Modal
      width={700}
      title={I18n.t('user.modals.exports.title')}
      visible
      onCancel={close}
      footer={[
        <Button
          key="back"
          onClick={close}
        >
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={exportInProgress}
          disabled={exportInProgress}
          onClick={handleExportUsers}
        >
          {I18n.t('common.actions.export')}
        </Button>,
      ]}
    >
      <Checkbox onChange={({ target: { checked } }) => { setexportSignInUrl(checked) }}>
        {I18n.t('user.modals.exports.export_sign_in_url')}
      </Checkbox>
    </Modal>
  )
}
