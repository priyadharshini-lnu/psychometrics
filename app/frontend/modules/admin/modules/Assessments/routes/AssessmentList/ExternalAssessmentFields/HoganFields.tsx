import React, { useEffect } from 'react'
import {
  Form, Select, Spin,
} from 'antd'
import { useResources } from '~/hooks/useResources'
import { ExternalAssessment } from '~/modules/admin/modules/client/core/externalAssessments'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { getAllExternalAssessments } from './getAllExternalAssessments'

const { I18n } = window

export const HoganFields: React.FC<{ assessment: Assessment | undefined }> = ({ assessment }) => {
  useEffect(() => {
    fetch({ apiConfig: { filter: { type_eq: 'hogan' } } })
  }, [])

  const { data: externalAssessments, fetch, isLoading } = useResources<ExternalAssessment>('external_assessments')

  return (
    <>
      <Form.Item
        name={['externalSettings', 'assessmentId']}
        label={I18n.t('assessments.column.external_settings.hogan_assessment_id')}
        rules={[{ required: true }]}
      >
        <Select
          notFoundContent={isLoading('fetch') ? <Spin size="small" /> : null}
        >
          {getAllExternalAssessments(externalAssessments, assessment?.externalSettings).map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  )
}
