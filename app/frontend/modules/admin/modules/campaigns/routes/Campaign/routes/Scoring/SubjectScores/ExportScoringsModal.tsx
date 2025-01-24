import React, { useState } from 'react'
import {
  Button, Modal, Checkbox,
} from 'antd'

const { I18n } = window


interface OwnProps {
  exportScorings: (params: { filters: Record<string, string[]> }) => Promise<void>
  close(): void
  open: boolean
}

export const ExportScoringsModal: React.FC<OwnProps> = ({
  close,
  open,
  exportScorings,
}) => {
  const [includeInactiveUsers, setIncludeInactiveUsers] = useState(false)
  const [exportInProgress, setExportInProgress] = useState(false)

  const handleExportScorings = () => {
    const filters = {
      campaign_users_active_in: includeInactiveUsers ? ['true', 'false'] : ['true'],
    }

    setExportInProgress(true)
    exportScorings({
      filters: filters as Record<string, string[]>,
    }).then(() => {
      setExportInProgress(false)
      close()
    })
  }

  return (
    <Modal
      width={700}
      open={open}
      title={I18n.t('user.modals.exports.title')}
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
          onClick={handleExportScorings}
        >
          {I18n.t('common.actions.export')}
        </Button>,
      ]}
    >
      <Checkbox onChange={({ target: { checked } }) => { setIncludeInactiveUsers(checked) }}>
        {I18n.t('user.modals.exports.include_inactive_users')}
      </Checkbox>
      <br />
    </Modal>
  )
}
