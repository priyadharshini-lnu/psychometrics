import React from 'react'
import { Form, Input } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'

interface Props {
  close(): void
  assessment: Assessment,
  parsedCampaignId: number,
  checked: boolean,
  updateWorkshopActivity: (campaignId: number, id: number, body) => Promise<void>
}

const { I18n } = window

export const WorkshopActivityDurationFormModal: React.FC<Props> = ({
  close, assessment, updateWorkshopActivity, parsedCampaignId, checked,
}) => {
  const [form] = Form.useForm()

  return (
    <ResourceFormModal
      resourceName="campaignAssessment"
      resource={assessment}
      readableResourceName={I18n.t('campaign_assessment.modals.workshop_activity_duration.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{
        updateResource: values => updateWorkshopActivity(parsedCampaignId,
          assessment.id, { ...values, workshopActivity: checked }),
      }}
      formProps={{ requiredMark: false }}
    >
      {() => (
        <>
          <Form.Item
            name="workshopActivityDuration"
            label={I18n.t('campaign_assessment.modals.workshop_activity_duration.form.duration')}
            rules={[{ required: true }]}
          >
            <Input type="number" min={1} max={480} style={{ width: '100%' }} />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
