import React from 'react'
import {
  Form, Select, Spin, Input,
} from 'antd'
import { FormInstance } from 'antd/lib/form'
import { useResources } from '~/hooks/useResources'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { Project } from '~/modules/admin/modules/client/core/projects'
import { ExternalAssessment } from '~/modules/admin/modules/client/core/externalAssessments'
import { getAllExternalAssessments } from './getAllExternalAssessments'

const { TextArea } = Input
const { I18n } = window


type OptionsType = {
  id: string
  name: string
}

export const IihtFields: React.FC<{
  form: FormInstance, assessment: Assessment, handleAssessmentSelect(value: string): void
}> = (
  { form, assessment, handleAssessmentSelect },
) => {
  const projectId = Form.useWatch(['projectId'], form)
  const ownerId = Form.useWatch(['ownerId'], form)

  const getProjects = (): OptionsType[] => {
    if (!assessment || !assessment.project || projects.find(d => assessment?.owner?.id === d.id)) {
      return projects
    }

    return [...projects, assessment.project]
  }

  const {
    data: externalAssessments, fetch: fetchAssessments, isLoading: assessmentIsLoading,
  } = useResources<ExternalAssessment>('external_assessments')


  const {
    data: projects, fetch: fetchProjects, isLoading: projectIsLoading,
  } = useResources<Project>('projects', { basePath: `clients/${ownerId}` })


  return (
    <>
      <Form.Item
        name="projectId"
        label={I18n.t('common.column.project')}
        rules={[{ required: true }]}
      >
        <Select
          showSearch={{
            filterOption: false,
            onSearch: (value) => {
              fetchProjects({
                apiConfig: {
                  filter: { filterable_fields: value, has_integration: 'iiht' },
                  fields: { clients: ['name'] },
                },
              })
            },
          }}
          disabled={!!assessment}
          notFoundContent={projectIsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
        >
          {getProjects().map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name={['externalSettings', 'assessmentId']}
        label={I18n.t('assessments.column.external_settings.iiht_assessment_name')}
        rules={[{ required: true }]}
      >
        <Select
          showSearch={{
            filterOption: false,
            onSearch: (value) => {
              fetchAssessments({
                apiConfig: { filter: { type_eq: 'iiht', filterable_fields: value, project_id_eq: projectId } },
              })
            },
          }}
          disabled={!!assessment}
          onSelect={(value) => {
            const selectedOption = externalAssessments.find(option => option.id === value)

            if (selectedOption) {
              handleAssessmentSelect(selectedOption.name)
            }
          }}
          notFoundContent={assessmentIsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
        >
          {!projectId ? [] : getAllExternalAssessments(externalAssessments, assessment?.externalSettings).map(
            ({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ),
          )}
        </Select>
      </Form.Item>
      <Form.Item
        name={['externalSettings', 'scheduleConfig']}
        label={I18n.t('assessments.column.external_settings.iiht_schedule_config')}
      >
        <TextArea />
      </Form.Item>
    </>
  )
}
