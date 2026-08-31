import React from 'react'
import { Form } from '@thetalententerprise/glint'
import { LuaEditor } from '~/glint'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'

const { I18n } = window

const JsonDataReportConfig: React.FC<ReportTypeConfigProps> = () => (
  <Form.Item
    name="configuration"
    label={I18n.t('admin.configuration')}
    rules={[{ required: true }]}
  >
    <LuaEditor mode="javascript" />
  </Form.Item>
)

export const jsonDataReportDefinition: ReportTypeDefinition = {
  key: 'json_data_report',
  component: JsonDataReportConfig,
  processConfiguration: data => data,
  uiRules: {
    defaultScope: 'client',
    scopeOptions: ['client'],
  },
}

export default JsonDataReportConfig
