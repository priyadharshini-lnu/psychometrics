import React, { useEffect, useState } from 'react'
import ResourceFormModal from 'components/ResourceFormModal'
import { Form, Input, Select } from 'antd'
import { STATUSES, TYPES as CAMPAIGN_TYPES } from 'modules/admin/constants/campaign'
import { TYPES as THREESIXTY_TYPES } from 'modules/admin/constants/threesixtyCampaign'

import _ from 'lodash'

const { Option } = Select

interface Props {
  projectId: number
  close(): void
  campaign: {
    id: number
  }
  fetchByAssessmentId(id: number): Promise<{ response: Assessment[] }>
  fetchTemplatesAndAssessments(projectId: number): Promise<TemplateAndAssessmentResponse>
}

interface Factor {
  id: number
  name: string
}

interface CampaignTemplate {
  id: number
  name: string
  assessmentId: number
}

interface Assessment {
  id: number
  name: string
}

interface TemplateAndAssessmentResponse{
  response: {
    templates: CampaignTemplate[]
    assessments: Assessment[]
  }
}

const ThreesixtyCampaignFormModal: React.FC<Props> = ({
  projectId,
  close,
  campaign,
  fetchByAssessmentId,
  fetchTemplatesAndAssessments,
}) => {
  const [form] = Form.useForm()
  const [factors, setFactors] = useState<Factor[]>([])
  const [campaignTemplates, setCampaignTemplates] = useState<CampaignTemplate[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])

  useEffect(() => {
    fetchTemplatesAndAssessments(projectId).then(
      ({ response: { templates, assessments } }: TemplateAndAssessmentResponse) => {
        setCampaignTemplates(templates)
        setAssessments(assessments)
      },
    )
  }, [])

  const handleCampaignTemplateChange = (campaignTemplateId: number) => {
    const campaignTemplate = _.find(campaignTemplates,
      (campaignTemplate: CampaignTemplate) => campaignTemplate.id === campaignTemplateId)
    if (campaignTemplate) { handleAssessmentChange(campaignTemplate.assessmentId) }
  }

  const handleAssessmentChange = (assessmentId: number) => {
    fetchByAssessmentId(assessmentId).then(({ response }) => {
      setFactors(response)
      form.setFieldsValue({ factors: _.map(response, (factor: Factor) => factor.id) })
    })
  }

  return (
    <ResourceFormModal
      resourceName="campaign"
      resourceBaseUrl={`/administration/projects/${projectId}/new_campaigns`}
      resource={campaign}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      modalProps={{ width: 550 }}
      formProps={{
        initialValues: {
          status: STATUSES.ACTIVE, type: CAMPAIGN_TYPES.THREESIXTY, threesixty_type: THREESIXTY_TYPES.EMPTY,
        },
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            required
          >
            <Select>
              {_.map(STATUSES, (status: string) => (
                <Option key={status} value={status}>{_.capitalize(status)}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="threesixty_type"
            label="Type"
            required
          >
            <Select>
              {_.map(THREESIXTY_TYPES, (status: string) => (
                <Option key={status} value={status}>{_.capitalize(status)}</Option>
              ))}
            </Select>
          </Form.Item>

          {form.getFieldValue('threesixty_type') === THREESIXTY_TYPES.STANDARD_360 && (
            <Form.Item
              name="campaign_template_id"
              label="Campaign template"
              rules={[{ required: true }]}
            >
              <Select onChange={handleCampaignTemplateChange}>
                {_.map(campaignTemplates, (template: CampaignTemplate) => (
                  <Option key={template.id} value={template.id}>{template.name}</Option>))}
              </Select>
            </Form.Item>
          )}

          {form.getFieldValue('threesixty_type') === THREESIXTY_TYPES.PREVIOUS_360 && (
            <Form.Item
              name="assessment_id"
              label="Assessment"
              rules={[{ required: true }]}
            >
              <Select onChange={handleAssessmentChange}>
                {_.map(assessments, (assessment: Assessment) => (
                  <Option key={assessment.id} value={assessment.id}>{assessment.name}</Option>))}
              </Select>
            </Form.Item>
          )}

          {form.getFieldValue('threesixty_type') !== THREESIXTY_TYPES.EMPTY && (
            <Form.Item
              name="factors"
              label="Factors"
            >
              <Select mode="multiple" maxTagCount={5}>
                {_.map(factors, (factor: Factor) => (
                  <Option value={factor.id}>{factor.name}</Option>))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="type" noStyle>
            <Input type="hidden" />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default ThreesixtyCampaignFormModal
