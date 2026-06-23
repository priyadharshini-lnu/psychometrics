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
  updateMhsLeadershipBar: (
    campaignId: string, assessmentId: number, body: object) => Promise<{ response: unknown }>
}

export const MhsLeadershipBarForm: FC<Props> = ({
  assessment, campaignId, I18n, updateMhsLeadershipBar,
}) => {
  const [loading, setLoading] = useState(false)
  const currentLeadershipBar = assessment?.externalConfig?.leadershipBar === 1
  const [leadershipBar, setLeadershipBar] = useState<boolean>(currentLeadershipBar)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [applyToExistingUsers, setApplyToExistingUsers] = useState(false)

  if (!assessment || assessment.category !== 'mhs') {
    return null
  }

  const { permissions } = assessment

  const handleSwitchChange = (checked: boolean) => {
    setLeadershipBar(checked)
    setConfirmModalVisible(true)
  }

  const handleCancel = () => {
    setLeadershipBar(!leadershipBar)
    setApplyToExistingUsers(false)
    setConfirmModalVisible(false)
  }

  const handleSubmit = () => {
    setLoading(true)
    const payload = {
      leadership_bar: leadershipBar ? 1 : 0,
      apply: applyToExistingUsers,
    }

    updateMhsLeadershipBar(campaignId, assessment.id, payload)
      .then(() => {
        message.success(I18n.t('admin.leadership_bar_update_success'))
      })
      .catch(() => {
        setLeadershipBar(!leadershipBar)
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
          label={I18n.t('admin.leadership_bar')}
        >
          <Switch
            checked={leadershipBar}
            loading={loading}
            disabled={!permissions.updateMhsLeadershipBar}
            onChange={handleSwitchChange}
          />
        </Descriptions.Item>
      </Descriptions>
      <Modal
        title={I18n.t('admin.leadership_bar')}
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

export default MhsLeadershipBarForm
