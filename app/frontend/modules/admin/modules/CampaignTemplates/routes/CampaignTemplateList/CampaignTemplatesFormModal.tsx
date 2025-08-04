import React, { useEffect } from 'react'
import {
  Form, Input, Select, Spin,
} from 'antd'
import { debounce } from 'lodash'
import { CampaignTemplate } from '~/modules/admin/core/types/campaignTemplates'
import { useResources } from '~/hooks/useResources'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Report } from '~/modules/admin/modules/client/core/reports'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { BaseMeta } from '~/hooks/useResources/interfaces'

const { Option } = Select

type Props = {
  close(): void
  campaignTemplate?: CampaignTemplate
}

const { I18n } = window

export const CampaignTemplatesFormModal: React.FC<Props> = ({ close, campaignTemplate }) => {
  const { resource } = useResourceContext<CampaignTemplate, BaseMeta>()
  const [form] = Form.useForm()

  const disabled = !!campaignTemplate?.campaign?.id

  const {
    data: assessments, fetch: fetchAssessments, isLoading,
  } = useResources<Assessment>('assessments')
  const assessmentsLoading = isLoading('fetch')

  const {
    data: reports, fetch: fetchReports, isLoading: isReportLoading,
  } = useResources<Report>('reports')
  const reportsLoading = isReportLoading('fetch')

  const {
    data: owners, fetch: fetchOwners, isLoading: isOwnerLoading,
  } = useResources<Client>('clients')
  const ownersLoading = isOwnerLoading('fetch')

  const assessmentsOpts = campaignTemplate?.assessment ? assessments.concat(campaignTemplate.assessment) : assessments
  const reportsOpts = campaignTemplate?.report ? reports.concat(campaignTemplate.report) : reports
  const ownerOpts = campaignTemplate?.owner ? owners.concat(campaignTemplate.owner) : owners

  const fetchAssessmentsByValue = (value: string) => fetchAssessments({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })

  const fetchReportsByValue = (value: string) => fetchReports({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })


  const fetchOwnersByValue = (value: string) => fetchOwners({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })

  const searchAvailableAssessments = debounce((value) => {
    fetchAssessmentsByValue(value)
  }, 50)

  const searchAvailableReports = debounce((value) => {
    fetchReportsByValue(value)
  }, 50)

  const searchAvailableOwners = debounce((value) => {
    fetchOwnersByValue(value)
  }, 50)


  useEffect(() => {
    fetchAssessmentsByValue('')
    fetchReportsByValue('')
    fetchOwnersByValue('')
  }, [])

  return (
    <ResourceFormModal
      resourceName="campaign_templates"
      resource={campaignTemplate}
      readableResourceName={I18n.t('administration.campaign_templates.form.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.campaign_templates.form.name')}
            rules={[{ required: true, transform: value => value.trim() }]}
          >
            <Input
              placeholder={
                I18n.t('administration.campaign_templates.form.name_placeholder')
              }
            />
          </Form.Item>
          <Form.Item
            name="assessmentId"
            label={I18n.t('administration.campaign_templates.form.assessment')}
            rules={[{ required: true }]}
          >
            <Select
              disabled={disabled}
              showSearch
              filterOption={false}
              placeholder={
                I18n.t('administration.campaign_templates.form.assessment_placeholder')
              }
              onSearch={searchAvailableAssessments}
              notFoundContent={assessmentsLoading ? <Spin size="small" /> : null}
            >
              {
                assessmentsOpts.map(({ id, name }) => (
                  <Option key={id} value={id}>{name}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="reportId"
            label={I18n.t('administration.campaign_templates.form.report')}
            rules={[{ required: true }]}
          >
            <Select
              disabled={disabled}
              showSearch
              filterOption={false}
              placeholder={
                I18n.t('administration.campaign_templates.form.report_placeholder')
              }
              onSearch={searchAvailableReports}
              notFoundContent={reportsLoading ? <Spin size="small" /> : null}
            >
              {
                reportsOpts.map(({ id, name }) => (
                  <Option key={id} value={id}>{name}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="ownerId"
            label={I18n.t('administration.campaign_templates.form.owner')}
          >
            <Select
              disabled={disabled}
              showSearch
              filterOption={false}
              placeholder={
                I18n.t('administration.campaign_templates.form.owner_placeholder')
              }
              onSearch={searchAvailableOwners}
              notFoundContent={ownersLoading ? <Spin size="small" /> : null}
            >
              {
                ownerOpts.map(({ id, name }) => (
                  <Option key={id} value={id}>{name}</Option>
                ))
              }
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
