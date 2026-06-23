import { FC, useState } from 'react'
import {
  Button, Modal, Checkbox, Descriptions, Select, message,
} from 'antd'
import { EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

const { Option } = Select

interface Props {
  I18n: I18nInterface
  assessment: Assessment | undefined
  campaignId: string
  updateMhsNormRegion: (
    campaignId: string, assessmentId: number, body: object) => Promise<{ response: unknown }>
}

export const MhsNormRegionForm: FC<Props> = ({
  assessment, campaignId, I18n, updateMhsNormRegion,
}) => {
  const permissions = assessment?.permissions
  const mhsNormRegions = assessment?.mhsNormRegions

  const currentNormRegion = assessment?.externalConfig?.normRegion || 6
  const filterSelectedNormRegion = mhsNormRegions?.find(region => region.value === currentNormRegion)
    || { label: '', value: 0 }
  const [selectedNormRegion, setSelectedNormRegion] = useState<{ label: string; value: number }>(
    filterSelectedNormRegion,
  )
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [applyToExistingUsers, setApplyToExistingUsers] = useState(false)

  if (!assessment || assessment.category !== 'mhs' || !mhsNormRegions) {
    return null
  }

  const handleEditClick = () => {
    setApplyToExistingUsers(false)
    setModalVisible(true)
  }

  const handleCancel = () => {
    setModalVisible(false)
    setApplyToExistingUsers(false)
    setSelectedNormRegion(filterSelectedNormRegion)
  }

  const handleSubmit = () => {
    setLoading(true)
    const payload = {
      norm_region: selectedNormRegion.value,
      apply: applyToExistingUsers,
    }
    updateMhsNormRegion(campaignId, assessment.id, payload)
      .then(() => {
        message.success(I18n.t('admin.norm_region_update_success'))
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
          label={I18n.t('admin.norm_region')}
        >
          <span>{selectedNormRegion.label}</span>
          {permissions?.updateMhsNormRegion && (
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
        title={I18n.t('admin.norm_region')}
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
            value={selectedNormRegion.value}
            placeholder={I18n.t('admin.norm_region_form_select')}
            onChange={(val) => {
              const region = mhsNormRegions.find(r => r.value === val)
              setSelectedNormRegion(region || { label: '', value: 0 })
            }}
            style={{ width: '100%' }}
          >
            {mhsNormRegions.map(region => (
              <Option key={region.value} value={region.value}>
                {region.label}
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

export default MhsNormRegionForm
