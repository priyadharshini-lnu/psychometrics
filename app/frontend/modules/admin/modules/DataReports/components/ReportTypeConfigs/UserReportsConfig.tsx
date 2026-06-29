import React from 'react'
import { Form, Select } from 'antd'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'

const { I18n } = window

const UserReportsConfig: React.FC<ReportTypeConfigProps> = ({
  parsedConfiguration,
}) => (
  <Form.Item
    name="projectIds"
    label={I18n.t('admin.project_ids')}
    initialValue={(parsedConfiguration?.project_ids as string[])?.map(String) || []}
    rules={[{ required: true, message: I18n.t('admin.select_projects_required') }]}
  >
    <Select
      mode="tags"
      placeholder={I18n.t('admin.enter_project_ids')}
      tokenSeparators={[',', ' ']}
    />
  </Form.Item>
)

export const userReportsDefinition: ReportTypeDefinition = {
  key: 'user_reports_export',
  component: UserReportsConfig,
  processConfiguration: (data) => {
    const projectIds = data.projectIds as string[] || []
    return {
      ...data,
      configuration: JSON.stringify({ project_ids: projectIds.map(id => parseInt(id, 10)) }),
      projectIds: undefined,
    }
  },
}

export default UserReportsConfig
