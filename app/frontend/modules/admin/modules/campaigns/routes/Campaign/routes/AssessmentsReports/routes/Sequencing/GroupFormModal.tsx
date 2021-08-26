import React from 'react'
import ResourceFormModal from 'components/ResourceFormModal'
import {
  Form, Input, Checkbox,
} from 'antd'

const { I18n } = window

interface Props {
  projectId: string
  campaignId: string
  close(): void
  group?: {
    id: number
  }
}

const GroupFormModal: React.FC<Props> = ({
  campaignId,
  close,
  group,
}) => (
  <ResourceFormModal
    resourceName="assessment_groups"
    readableResourceName={I18n.t('assessments_reports.add_group_form.title')}
    requestScope="campaigns"
    resourceBaseUrl={`/administration/new_campaigns/${campaignId}/campaign_assessment_groups`}
    resource={group}
    showSuccessMessages
    close={close}
    modalProps={{ width: 550 }}
  >
    {() => (
      <>
        <Form.Item
          name="name"
          label={I18n.t('assessments_reports.add_group_form.name')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="previousAssessmentsRequired"
          valuePropName="checked"
        >
          <Checkbox>{I18n.t('assessments_reports.add_group_form.previous_assessments_required')}</Checkbox>
        </Form.Item>
        <Form.Item
          name="previousGroupRequired"
          valuePropName="checked"
        >
          <Checkbox>{I18n.t('assessments_reports.add_group_form.previous_group_required')}</Checkbox>
        </Form.Item>
      </>
    )}
  </ResourceFormModal>
)

export default GroupFormModal
