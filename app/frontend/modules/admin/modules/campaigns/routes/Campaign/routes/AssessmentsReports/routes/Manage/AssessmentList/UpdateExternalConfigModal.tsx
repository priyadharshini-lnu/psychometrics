import React from 'react'
import { Input, Form } from 'antd'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import ResourceFormModal from '~/components/ResourceFormModal'
import { PropsFromRedux } from './connect'

const { I18n } = window

export interface OwnProps {
  close(): void
  assessment: Assessment
  campaignId: number
  campaignAssessmentId: number,
  updateExternalConfig: (campaignId: number, campaignAssessmentId: number, externalConfig: object) => Promise<void>
}

export type Props = OwnProps & PropsFromRedux

export const UpdateExternalConfigModal: React.FC<Props> = ({
  close, campaignId, assessment, updateExternalConfig,
}) => (
  <ResourceFormModal
    title={I18n.t('campaign_assessment.modals.update_external_config.title')}
    resourceName="campaignAssessment"
    readableResourceName="External Config"
    requestScope="campaignAssessment"
    resource={
      {
        ...assessment,
        externalConfig: assessment.externalConfig ? JSON.stringify(assessment.externalConfig, null, 2) : null,
      }
    }
    request={{
      updateResource: values => updateExternalConfig(campaignId, assessment.campaignAssessmentId, values),
    }}
    showSuccessMessages
    close={close}
    scrollToFirstError
    modalProps={{ width: 620 }}
  >
    {() => (
      <Form.Item
        name="externalConfig"
        label={I18n.t('campaign_assessment.modals.update_external_config.text_placeholder')}
      >
        <Input.TextArea rows={6} />
      </Form.Item>
    )}
  </ResourceFormModal>
)
