import React from 'react'
import { Form, Select } from 'antd'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'

const { I18n } = window

const ReportUsageSummaryConfig: React.FC<ReportTypeConfigProps> = ({
  parsedConfiguration,
}) => (
  <>
    <Form.Item
      name="projectIds"
      label={I18n.t('admin.project_ids')}
      initialValue={(parsedConfiguration?.project_ids as string[])?.map(String) || []}
      rules={[{ required: true, message: I18n.t('admin.select_project_ids_required') }]}
    >
      <Select
        mode="tags"
        placeholder={I18n.t('admin.enter_project_ids')}
        tokenSeparators={[',', ' ']}
      />
    </Form.Item>

    <Form.Item
      name="reportIds"
      label={I18n.t('admin.report_ids')}
      initialValue={(parsedConfiguration?.report_ids as string[])?.map(String) || []}
      rules={[{ required: true, message: I18n.t('admin.select_report_ids_required') }]}
    >
      <Select
        mode="tags"
        placeholder={I18n.t('admin.enter_report_ids')}
        tokenSeparators={[',', ' ']}
      />
    </Form.Item>
  </>
)

export const reportUsageSummaryDefinition: ReportTypeDefinition = {
  key: 'report_usage_summary',
  component: ReportUsageSummaryConfig,
  processConfiguration: (data) => {
    const projectIds = (data.projectIds as string[]) || []
    const reportIds = (data.reportIds as string[]) || []

    return {
      ...data,
      configuration: JSON.stringify({
        project_ids: projectIds.map(id => parseInt(id, 10)),
        report_ids: reportIds.map(id => parseInt(id, 10)),
      }),
      projectIds: undefined,
      reportIds: undefined,
    }
  },
}

export default ReportUsageSummaryConfig
