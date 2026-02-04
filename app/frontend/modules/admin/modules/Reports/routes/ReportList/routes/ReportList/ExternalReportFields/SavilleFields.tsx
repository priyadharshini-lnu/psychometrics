import React, { useEffect } from 'react'
import {
  Form, FormInstance, Select, Spin,
} from 'antd'
import { useResources } from '~/hooks/useResources'
import { ExternalAssessment } from '~/modules/admin/modules/client/core/externalAssessments'

const { I18n } = window

export const SavilleFields: React.FC<{ form: FormInstance }> = ({ form }) => {
  const assessmentIds = Form.useWatch('assessmentIds', form)
  useEffect(() => {
    fetch({ apiConfig: { filter: { type_eq: 'saville', assessment_ids_in: assessmentIds } } })
  }, [assessmentIds])

  const { data: externalReports, fetch, isLoading } = useResources<ExternalAssessment>('external_reports')

  return (
    <>
      <Form.Item
        name={['externalSettings', 'reportId']}
        label={I18n.t('reports.columns.external_settings.saville_report_id')}
      >
        <Select
          notFoundContent={isLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
          showSearch={{
            filterOption: (input, option) => (option?.key?.toLowerCase().indexOf(input.toLowerCase()) >= 0),
          }}
        >
          {externalReports.map(({ id, name }) => {
            const label = `${name} - ${id}`
            return <Select.Option key={label} value={id}>{label}</Select.Option>
          })}
        </Select>
      </Form.Item>
    </>
  )
}
