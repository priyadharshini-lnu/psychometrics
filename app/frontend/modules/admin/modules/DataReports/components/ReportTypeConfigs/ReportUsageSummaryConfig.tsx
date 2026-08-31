import React from 'react'
import { DatePicker, Form, Select } from '@thetalententerprise/glint'
import dayjs from '~/utils/dayjs'
import ProjectSearchField from './ProjectSearchField'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'

const { I18n } = window

const ReportUsageSummaryConfig: React.FC<ReportTypeConfigProps> = ({
  parsedConfiguration,
  scope,
  ownerId,
}) => (
  <>
    <ProjectSearchField
      scope={scope}
      ownerId={ownerId}
      parsedConfiguration={parsedConfiguration}
      required={scope === 'client'}
    />

    <Form.Item
      name="reportIds"
      label={I18n.t('admin.report_ids')}
      initialValue={
        (parsedConfiguration?.report_ids as string[])?.map(String) || []
      }
      rules={[
        {
          required: true,
          message: I18n.t('admin.select_report_ids_required'),
        },
      ]}
    >
      <Select
        mode="tags"
        placeholder={I18n.t('admin.enter_report_ids')}
        tokenSeparators={[',', ' ']}
      />
    </Form.Item>

    <Form.Item
      name="dateRange"
      label={I18n.t('admin.date_range')}
      initialValue={
        parsedConfiguration?.start_date
        && parsedConfiguration?.end_date
          ? [
            dayjs(parsedConfiguration.start_date as string),
            dayjs(parsedConfiguration.end_date as string),
          ]
          : undefined
      }
    >
      <DatePicker.RangePicker />
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

        start_date: data.dateRange
          ? dayjs(data.dateRange[0]).format('YYYY-MM-DD')
          : null,

        end_date: data.dateRange
          ? dayjs(data.dateRange[1]).format('YYYY-MM-DD')
          : null,
      }),

      projectIds: undefined,
      reportIds: undefined,
      dateRange: undefined,
    }
  },
}

export default ReportUsageSummaryConfig
