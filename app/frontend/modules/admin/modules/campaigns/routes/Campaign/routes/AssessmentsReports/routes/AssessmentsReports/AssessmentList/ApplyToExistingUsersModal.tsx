import React from 'react'
import { Form, Checkbox } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'

interface Props {
  close(): void
  assessment: Assessment,
  parsedCampaignId: number,
  checked: boolean,
  updatePrework: (campaignId: number, id: number, body) => Promise<void>
}

const { I18n } = window

export const ApplyToExistingUsersFormModal: React.FC<Props> = ({
  close, assessment, updatePrework, parsedCampaignId, checked,
}) => {
  const [form] = Form.useForm()

  const checkboxLabel = checked
    ? I18n.t('campaign_assessment.modals.prework_setting.enable')
    : I18n.t('campaign_assessment.modals.prework_setting.disable')


  return (
    <ResourceFormModal
      resourceName="campaignAssessment"
      resource={assessment}
      readableResourceName={I18n.t('campaign_assessment.modals.prework_setting.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 600 }}
      request={{
        updateResource: values => updatePrework(parsedCampaignId,
          assessment.id, { ...values, prework: checked }),
      }}
      formProps={{ requiredMark: false }}
    >
      {() => (
        <Form.Item name="applyToExistingUsers" valuePropName="checked">
          <Checkbox>
            {checkboxLabel}
          </Checkbox>
        </Form.Item>
      )}
    </ResourceFormModal>
  )
}
