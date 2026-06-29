import React from 'react'
import { DatePicker, Form, Select } from 'antd'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'
import dayjs from '~/utils/dayjs'

const { I18n } = window

type ParsedConfiguration = {
  client_ids?: string[]
  year_range?: [number, number] | number[]
}

const ClientAssessmentCountsConfig: React.FC<ReportTypeConfigProps> = ({
  parsedConfiguration,
}) => {
  const config = parsedConfiguration as ParsedConfiguration | undefined

  const yearRangeValue = Array.isArray(config?.year_range) && config.year_range.length === 2
    ? [
      dayjs().year(Number(config!.year_range![0])),
      dayjs().year(Number(config!.year_range![1])),
    ]
    : undefined

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
        name="yearRange"
        label={I18n.t('admin.year_range')}
        initialValue={yearRangeValue}
        rules={[{ required: false }]}
      >
        <DatePicker.RangePicker picker="year" />
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
      year_range: data.yearRange
        ? [
          dayjs(data.yearRange[0]).year(),
          dayjs(data.yearRange[1]).year(),
        ]
        : null,
    }),
    clientIds: undefined,
    yearRange: undefined,
  }),
}

export default ClientAssessmentCountsConfig
