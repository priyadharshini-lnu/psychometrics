import React, { useEffect } from 'react'
import {
  Form, Select, Spin,
} from 'antd'
import { FormInstance } from 'antd/lib/form'
import { useResources } from '~/hooks/useResources'
import { ExternalAssessment } from '~/modules/admin/modules/client/core/externalAssessments'

const { I18n } = window

export const HoganFields: React.FC<{ form: FormInstance }> = ({ form }) => {
  const assessmentIds = Form.useWatch('assessmentIds', form)

  useEffect(() => {
    fetch({ apiConfig: { filter: { type_eq: 'hogan', assessment_ids_in: assessmentIds } } })
  }, [assessmentIds])

  const { data: externalReports, fetch, isLoading } = useResources<ExternalAssessment>('external_reports', {
    trackUrl: true,
  })

  return (
    <>
      <Form.Item
        name={['externalSettings', 'reportId']}
        label={I18n.t('reports.columns.external_settings.hogan_report_id')}
      >
        <Select notFoundContent={isLoading('fetch') ? <Spin size="small" /> : null}>
          {externalReports.map(({ id, name }) => (
            <Select.Option key={id} value={id}>{`${name} - ${id}`}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  )
}
