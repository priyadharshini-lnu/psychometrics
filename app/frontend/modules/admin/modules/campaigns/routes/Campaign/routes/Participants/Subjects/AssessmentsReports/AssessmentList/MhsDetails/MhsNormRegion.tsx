import { FC, useState } from 'react'
import {
  Button, Modal, Descriptions, Select, message,
} from 'antd'
import { EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

const { Option } = Select

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment | undefined
  campaignId: string
  updateMhsNormRegion: (
    campaignId: string, campaignAssessmentId: number, body: {assessment: {id: string}}
  ) => Promise<{ response: unknown; }>
}

export const MhsNormRegion: FC<Props> = ({
  assessment, campaignId, I18n, updateMhsNormRegion,
}) => {
  const permissions = assessment?.permissions
  const mhsNormRegions = assessment?.mhsUserAssessmentDetails?.normRegions
  const currentNormRegion = assessment?.mhsUserAssessmentDetails?.normRegion || 0

  const filterSelectedNormRegion = mhsNormRegions?.find(
    region => region.value === currentNormRegion,
  ) || { value: 0, label: 'Global' }


  const [selectedNormRegion, setSelectedNormRegion] = useState<{ label: string; value: number }>(
    filterSelectedNormRegion,
  )

  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!assessment || assessment.category !== 'mhs' || !mhsNormRegions) {
    return null
  }

  const handleEditClick = () => {
    setModalVisible(true)
  }

  const handleCancel = () => {
    setModalVisible(false)
    setSelectedNormRegion(filterSelectedNormRegion)
  }

  const handleSubmit = () => {
    setLoading(true)

    const payload = {
      assessment: {
        id: String(assessment.id),
        norm_region: selectedNormRegion.value,
      },
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
      </Modal>
    </>
  )
}

export default MhsNormRegion
