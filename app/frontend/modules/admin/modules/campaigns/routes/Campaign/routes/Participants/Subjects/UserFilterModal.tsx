import React, { useState } from 'react'
import {
  Button, Modal, Checkbox,
} from 'antd'

const { I18n } = window

interface SingleIdAction {
  (id: number, body: object): Promise<void>;
}

interface DoubleIdAction {
  (id1: number, id2: number, body: object): Promise<void>;
}

interface OwnProps {
  id?: number;
  ids?: [number, number];
  action: SingleIdAction | DoubleIdAction;
  onSuccess?(): void
  close(): void
  body?: object
}

export const UserFilterModal: React.FC<OwnProps> = ({
  id,
  ids,
  close,
  onSuccess,
  action,
  body = {},
}) => {
  const [exportInProgress, setExportInProgress] = useState(false)
  const [includeInactiveUsers, setIncludeInactiveUsers] = useState(false)

  const handleExport = () => {
    setExportInProgress(true)
    const payload = { ...body, includeInactiveUsers }

    if (id) {
      (action as SingleIdAction)(id, payload)
        .then(() => {
          onSuccess?.()
          setExportInProgress(false)
          close()
        })
    } else if (ids) {
      (action as DoubleIdAction)(ids[0], ids[1], payload)
        .then(() => {
          onSuccess?.()
          setExportInProgress(false)
          close()
        })
    }
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
          onClick={handleExport}
        >
          {I18n.t('common.actions.export')}
        </Button>,
      ]}
    >
      <Checkbox onChange={({ target: { checked } }) => { setIncludeInactiveUsers(checked) }}>
        {I18n.t('user.modals.exports.include_inactive_users')}
      </Checkbox>
    </Modal>
  )
}
