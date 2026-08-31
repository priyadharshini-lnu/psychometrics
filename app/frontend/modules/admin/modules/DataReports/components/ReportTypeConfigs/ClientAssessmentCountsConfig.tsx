import React from 'react'
import { DatePicker, Form, Select } from '@thetalententerprise/glint'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'
import dayjs from '~/utils/dayjs'

const { I18n } = window

type ParsedConfiguration = {
  client_ids?: string[]
  start_date?: string
  end_date?: string
}

const ClientAssessmentCountsConfig: React.FC<ReportTypeConfigProps> = ({
  parsedConfiguration,
}) => {
  const config = parsedConfiguration as ParsedConfiguration | undefined

  return (
    <>
      <Form.Item
        name="clientIds"
        label={I18n.t('admin.client_ids')}
        initialValue={config?.client_ids?.map(String) || []}
        rules={[{ required: false }]}
      >
        <Select
          mode="tags"
          placeholder={I18n.t('admin.enter_client_ids')}
          tokenSeparators={[',', ' ']}
        />
      </Form.Item>

      <Form.Item
        name="dateRange"
        label={I18n.t('admin.date_range')}
        initialValue={
          config?.start_date && config?.end_date
            ? [
              dayjs(config.start_date),
              dayjs(config.end_date),
            ]
            : undefined
        }
      >
        <DatePicker.RangePicker />
      </Form.Item>
    </>
  )
}

export const clientAssessmentCountsDefinition: ReportTypeDefinition = {
  key: 'client_assessment_counts',
  component: ClientAssessmentCountsConfig,
  uiRules: {
    defaultScope: 'global',
    scopeOptions: ['global'],
    hideOwnerWhenGlobal: true,
  },
  processConfiguration: data => ({
    ...data,
    configuration: JSON.stringify({
      client_ids: data.clientIds,
      start_date: data.dateRange
        ? dayjs(data.dateRange[0]).format('YYYY-MM-DD')
        : null,
      end_date: data.dateRange
        ? dayjs(data.dateRange[1]).format('YYYY-MM-DD')
        : null,
    }),
    clientIds: undefined,
    dateRange: undefined,
  }),
}

export default ClientAssessmentCountsConfig
