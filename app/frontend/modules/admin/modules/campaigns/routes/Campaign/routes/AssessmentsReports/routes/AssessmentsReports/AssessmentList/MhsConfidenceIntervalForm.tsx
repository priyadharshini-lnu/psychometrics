import { FC, useState } from 'react'
import {
  message, Descriptions, Switch,
  Modal,
  Button,
  Checkbox,
} from 'antd'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  I18n: I18nInterface
  assessment: Assessment | undefined
  campaignId: string
  updateMhsConfidenceInterval: (
    campaignId: string, assessmentId: number, body: object) => Promise<{ response: unknown }>
}

export const MhsConfidenceIntervalForm: FC<Props> = ({
  assessment, campaignId, I18n, updateMhsConfidenceInterval,
}) => {
  const [loading, setLoading] = useState(false)
  const currentConfidenceInterval = assessment?.externalConfig?.confidenceInterval === 1
  const [confidenceInterval, setConfidenceInterval] = useState<boolean>(currentConfidenceInterval)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [applyToExistingUsers, setApplyToExistingUsers] = useState(false)

  if (!assessment || assessment.category !== 'mhs') {
    return null
  }

  const { permissions } = assessment

  const handleSwitchChange = (checked: boolean) => {
    setConfidenceInterval(checked)
    setConfirmModalVisible(true)
  }

  const handleCancel = () => {
    setConfidenceInterval(!confidenceInterval)
    setApplyToExistingUsers(false)
    setConfirmModalVisible(false)
  }

  const handleSubmit = () => {
    setLoading(true)
    const payload = {
      confidence_interval: confidenceInterval ? 1 : 0,
      apply: applyToExistingUsers,
    }

    updateMhsConfidenceInterval(campaignId, assessment.id, payload)
      .then(() => {
        message.success(I18n.t('admin.confidence_interval_update_success'))
      })
      .catch(() => {
        setConfidenceInterval(!confidenceInterval)
      })
      .finally(() => {
        setApplyToExistingUsers(false)
        setConfirmModalVisible(false)
        setLoading(false)
      })
  }

  return (
    <>
      <Descriptions
        layout="horizontal"
        rootClassName="w-100"
        bordered
        column={1}
      >
        <Descriptions.Item
          className="va-t w-30"
          styles={{
            label: { width: '40%' },
            content: { width: '60%' },
          }}
          label={I18n.t('admin.confidence_interval')}
        >
          <Switch
            checked={confidenceInterval}
            loading={loading}
            disabled={!permissions.updateMhsConfidenceInterval}
            onChange={handleSwitchChange}
          />
        </Descriptions.Item>
      </Descriptions>
      <Modal
        title={I18n.t('admin.confidence_interval')}
        open={confirmModalVisible}
        getContainer={false}
        closable={false}
        footer={[
          <Button key="cancel" onClick={handleCancel} disabled={loading}>
            {I18n.t('common.actions.cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
            {I18n.t('common.actions.update')}
          </Button>,
        ]}
      >
        <div className="mt-4 mb-6">
          <Checkbox
            checked={applyToExistingUsers}
            onChange={e => setApplyToExistingUsers(e.target.checked)}
          >
            {I18n.t('admin.apply_to_existing_users')}
          </Checkbox>
        </div>
      </Modal>
    </>
  )
}

export default MhsConfidenceIntervalForm
