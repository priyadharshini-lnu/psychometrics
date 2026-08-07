import React, { useRef } from 'react'
import {
  Button,
  Drawer,
  Space,
} from 'antd'
import { AiArtifact } from '~/modules/admin/modules/campaigns/core/aiArtifacts'
import { SettingsForm, SettingsFormRef } from './SettingsForm'

type Props = {
  onClose(): void
  aiArtifact?: AiArtifact
  isOpen: boolean
}

const { I18n } = window

export const SettingsDrawer: React.FC<Props> = ({ onClose, isOpen, aiArtifact }) => {
  const settingsFormRef = useRef<SettingsFormRef>(null)

  const isEdit = () => (!!aiArtifact?.id)
  const getTitle = () => `${isEdit() ? I18n.t('common.actions.edit') : I18n.t('common.actions.add')}
     ${I18n.t('admin.form_title')}`

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = () => {
    settingsFormRef.current?.submit()
  }

  return (
    <Drawer
      title={getTitle()}
      placement="right"
      width={aiArtifact ? 1024 : 600}
      height="100vh"
      zIndex={1001}
      open={isOpen}
      onClose={handleClose}
      maskClosable={false}
      focusable={{
        trap: false,
      }}
      closable={false}
      styles={{
        body: {
          height: '100%',
          overflowY: 'hidden',
          padding: 0,
        },
      }}
      extra={(
        <Space>
          <Button htmlType="reset" onClick={handleClose}>{I18n.t('common.actions.cancel')}</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
          >
            {I18n.t('shared.submit')}
          </Button>
        </Space>
      )}
    >
      {isOpen ? <SettingsForm ref={settingsFormRef} onClose={onClose} aiArtifact={aiArtifact} /> : null}
    </Drawer>
  )
}
