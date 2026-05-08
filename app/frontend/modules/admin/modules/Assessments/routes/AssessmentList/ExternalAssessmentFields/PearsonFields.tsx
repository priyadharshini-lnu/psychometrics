import React, { useEffect } from 'react'
import {
  Form, Select, Spin,
} from 'antd'
import { FormInstance } from 'antd/es/form'
import { useResources } from '~/hooks/useResources'
import { ExternalAssessment } from '~/modules/admin/modules/client/core/externalAssessments'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { getAllExternalAssessments } from './getAllExternalAssessments'

const { I18n } = window

export const PearsonFields: React.FC<{
  form: FormInstance, assessment: Assessment | undefined, handleAssessmentSelect(value: string): void
}> = (
  { form, assessment, handleAssessmentSelect },
) => {
  const assessmentId = Form.useWatch(['externalSettings', 'assessmentId'], form)

  useEffect(() => {
    if (assessmentId) {
      fetchNorms({ apiConfig: { filter: { type_eq: 'pearson', assessment_id_eq: assessmentId } } })
    }
  }, [assessmentId])

  const {
    data: externalAssessments, fetch: fetchAssessments, isLoading: assessmentIsLoading,
  } = useResources<ExternalAssessment>('external_assessments')


  const {
    data: norms, fetch: fetchNorms, isLoading: normIsLoading,
  } = useResources<ExternalAssessment>('external_norms')

  return (
    <>
      <Form.Item
        name={['externalSettings', 'assessmentId']}
        label={I18n.t('assessments.column.external_settings.pearson_assessment_name')}
        rules={[{ required: true }]}
      >
        <Select
          disabled={!!assessment}
          showSearch={{
            filterOption: false,
            onSearch: (value) => {
              fetchAssessments({
                apiConfig: { filter: { type_eq: 'pearson', filterable_fields: value } },
              })
            },
          }}
          notFoundContent={assessmentIsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
          onSelect={(value) => {
            const selectedOption = externalAssessments.find(option => option.id === value)
            if (selectedOption) {
              handleAssessmentSelect(selectedOption.name)
            }
          }}
        >
          {getAllExternalAssessments(externalAssessments, assessment?.externalSettings).map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name={['externalSettings', 'normId']}
        label={I18n.t('assessments.column.external_settings.pearson_norm_id')}
      >
        <Select
          notFoundContent={normIsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
          showSearch={{
            filterOption: false,
          }}
        >
          {!assessmentId ? [] : norms.map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  )
}
