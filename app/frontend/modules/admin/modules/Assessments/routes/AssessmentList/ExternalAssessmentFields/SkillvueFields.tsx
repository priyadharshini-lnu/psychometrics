import React from 'react'
import {
  Form, Select, Spin,
} from 'antd'
import { FormInstance } from 'antd/lib/form'
import { useResources } from '~/hooks/useResources'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { Project } from '~/modules/admin/modules/client/core/projects'
import { ExternalAssessment } from '~/modules/admin/modules/client/core/externalAssessments'
import { getAllExternalAssessments } from './getAllExternalAssessments'

const { I18n } = window

type OptionsType = {
  id: string
  name: string
}

export const SkillvueFields: React.FC<{
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
          disabled={!!assessment}
          showSearch
          onSearch={(value) => {
            fetchProjects({
              apiConfig: {
                filter: { filterable_fields: value, has_integration: 'skillvue' },
                fields: { clients: ['name'] },
              },
            })
          }}
          notFoundContent={projectIsLoading('fetch') ? <Spin size="small" /> : null}
          filterOption={false}
        >
          {getProjects().map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name={['externalSettings', 'assessmentId']}
        label={I18n.t('assessments.column.external_settings.skillvue_assessment_name')}
        rules={[{ required: true }]}
      >
        <Select
          disabled={!!assessment}
          showSearch
          onSearch={(value) => {
            fetchAssessments({
              apiConfig: { filter: { type_eq: 'skillvue', filterable_fields: value, project_id_eq: projectId } },
            })
          }}
          onSelect={(value) => {
            const selectedOption = externalAssessments.find(option => option.id === value)

            if (selectedOption) {
              handleAssessmentSelect(selectedOption.name)
            }
          }}
          notFoundContent={assessmentIsLoading('fetch') ? <Spin size="small" /> : null}
          filterOption={false}
        >
          {!projectId ? [] : getAllExternalAssessments(externalAssessments, assessment?.externalSettings).map(
            ({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ),
          )}
        </Select>
      </Form.Item>
    </>
  )
}
