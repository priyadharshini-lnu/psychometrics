import React, { useState } from 'react'
import {
  Button, Modal, Checkbox,
} from 'antd'

const { I18n } = window


interface OwnProps {
  campaignId: number
  exportUsers: (campaignId: number, params: {
    exportSignInUrl: boolean, filters: Record<string, (string | string[]) >
  }) => Promise<void>
  permissions: { exportSignInUrl: boolean},
  close(): void
}

export const ExportUsersModal: React.FC<OwnProps> = ({
  close,
  campaignId,
  exportUsers,
  permissions,
}) => {
  const [exportSignInUrl, setexportSignInUrl] = useState(false)
  const [includeInactiveUsers, setIncludeInactiveUsers] = useState(false)
  const [exportInProgress, setExportInProgress] = useState(false)

  const handleExportUsers = () => {
    const filters = includeInactiveUsers
      ? { campaignUsersActiveIn: ['true', 'false'] } : { campaignUsersActiveIn: ['true'] }

    setExportInProgress(true)
    exportUsers(campaignId, { exportSignInUrl, filters }).then(() => {
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
      <Checkbox onChange={({ target: { checked } }) => { setIncludeInactiveUsers(checked) }}>
        {I18n.t('user.modals.exports.include_inactive_users')}
      </Checkbox>
      <br />

      {permissions.exportSignInUrl && (
        <Checkbox onChange={({ target: { checked } }) => { setexportSignInUrl(checked) }}>
          {I18n.t('user.modals.exports.export_sign_in_url')}
        </Checkbox>
      )}
    </Modal>
  )
}
