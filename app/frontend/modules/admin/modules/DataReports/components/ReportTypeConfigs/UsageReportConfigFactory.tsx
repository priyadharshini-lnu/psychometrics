import React from 'react'
import { Form, Select } from 'antd'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'

const { I18n } = window

export const UsageReportConfig: React.FC<ReportTypeConfigProps> = ({
  parsedConfiguration,
}) => (
  <Form.Item
    name="projectIds"
    label={I18n.t('admin.project_ids')}
    initialValue={(parsedConfiguration?.project_ids as string[])?.map(String) || []}
    rules={[
      {
        required: true,
        message: I18n.t('admin.select_projects_required'),
      },
    ]}
  >
    <Select
      mode="tags"
      placeholder={I18n.t('admin.enter_project_ids')}
      tokenSeparators={[',', ' ']}
    />
  </Form.Item>
)

const processUsageReportConfiguration = (data: Record<string, unknown>) => {
  const projectIds = (data.projectIds as string[]) || []

  return {
    ...data,
    configuration: JSON.stringify({
      project_ids: projectIds.map(id => parseInt(id, 10)),
    }),
    projectIds: undefined,
  }
}

export const createUsageReportDefinition = (key: string): ReportTypeDefinition => ({
  key,
  component: UsageReportConfig,
  processConfiguration: processUsageReportConfiguration,
})
