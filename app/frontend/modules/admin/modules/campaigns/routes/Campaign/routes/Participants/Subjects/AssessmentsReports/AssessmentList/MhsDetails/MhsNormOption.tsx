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
  updateMhsNormOption: (
    campaignId: string, campaignAssessmentId: number, body: {assessment: {id: string}}
  ) => Promise<{ response: unknown; }>
}

export const MhsNormOption: FC<Props> = ({
  assessment, campaignId, I18n, updateMhsNormOption,
}) => {
  const permissions = assessment?.permissions
  const mhsNormOptions = assessment?.mhsUserAssessmentDetails?.normOptions
  const currentNormOption = assessment?.mhsUserAssessmentDetails?.normOption || 0

  const filterSelectedNormOption = mhsNormOptions?.find(
    option => option.value === currentNormOption,
  ) || { value: 0, label: 'Global' }


  const [selectedNormOption, setSelectedNormOption] = useState<{ label: string; value: number }>(
    filterSelectedNormOption,
  )

  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!assessment || assessment.category !== 'mhs' || !mhsNormOptions) {
    return null
  }

  const handleEditClick = () => {
    setModalVisible(true)
  }

  const handleCancel = () => {
    setModalVisible(false)
    setSelectedNormOption(filterSelectedNormOption)
  }

  const handleSubmit = () => {
    setLoading(true)

    const payload = {
      assessment: {
        id: String(assessment.id),
        norm_option: selectedNormOption.value,
      },
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
              const option = mhsNormOptions.find(r => r.value === val)
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
      </Modal>
    </>
  )
}

export default MhsNormOption
