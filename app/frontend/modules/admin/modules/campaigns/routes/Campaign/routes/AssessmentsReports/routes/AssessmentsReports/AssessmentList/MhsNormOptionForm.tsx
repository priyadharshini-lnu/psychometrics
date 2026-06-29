import { FC, useState } from 'react'
import {
  Button, Modal, Select, Checkbox, Descriptions, message,
} from 'antd'
import { EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

const { Option } = Select

interface Props {
  I18n: I18nInterface
  assessment: Assessment | undefined
  campaignId: string
  updateMhsNormOption: (
    campaignId: string, assessmentId: number, body: object) => Promise<{ response: unknown }>
}

export const MhsNormOptionForm: FC<Props> = ({
  assessment, campaignId, I18n, updateMhsNormOption,
}) => {
  const permissions = assessment?.permissions
  const mhsNormOptions = assessment?.mhsNormOptions

  const currentNormOption = assessment?.externalConfig?.normOption ?? 0
  const filterSelectedNormOption = mhsNormOptions?.find(option => option.value === currentNormOption)
    || { label: '', value: 0 }
  const [selectedNormOption, setSelectedNormOption] = useState<{ label: string; value: number }>(
    filterSelectedNormOption,
  )
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [applyToExistingUsers, setApplyToExistingUsers] = useState(false)

  if (!assessment || assessment.category !== 'mhs' || !mhsNormOptions) {
    return null
  }

  const handleEditClick = () => {
    setApplyToExistingUsers(false)
    setModalVisible(true)
  }

  const handleCancel = () => {
    setModalVisible(false)
    setApplyToExistingUsers(false)
    setSelectedNormOption(filterSelectedNormOption)
  }

  const handleSubmit = () => {
    setLoading(true)
    const payload = {
      norm_option: selectedNormOption.value,
      apply: applyToExistingUsers,
    }
    updateMhsNormOption(campaignId, assessment.id, payload)
      .then(() => {
        message.success(I18n.t('admin.norm_option_update_success'))
      })
      .catch((err) => {
        message.error(err)
      })
      .finally(() => {
        setLoading(false)
        setModalVisible(false)
        setApplyToExistingUsers(false)
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
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('admin.norm_option')}
        >
          <span>{selectedNormOption.label}</span>
          {permissions?.updateMhsNormOption && (
            <Button
              type="link"
              icon={<EditOutlined />}
              className="ms-2"
              onClick={handleEditClick}
            />
          )}
        </Descriptions.Item>
      </Descriptions>
      <Modal
        title={I18n.t('admin.norm_option')}
        open={modalVisible}
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
          <Select
            value={selectedNormOption.value}
            placeholder={I18n.t('admin.norm_option_form_select')}
            onChange={(val) => {
              const option = mhsNormOptions.find(o => o.value === val)
              setSelectedNormOption(option || { label: '', value: 0 })
            }}
            style={{ width: '100%' }}
          >
            {mhsNormOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
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

export default MhsNormOptionForm
