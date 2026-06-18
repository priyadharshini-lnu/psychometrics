import React, { useEffect, useRef } from 'react'
import {
  Form, Select, Spin,
} from 'antd'
import { FormInstance } from 'antd/es/form'
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

export const MicrositeFields: React.FC<{
  form: FormInstance,
  assessment?: Assessment,
  handleAssessmentSelect(value: string): void
}> = (
  { form, assessment, handleAssessmentSelect },
) => {
  const projectId = Form.useWatch(['projectId'], form)
  const ownerId = Form.useWatch(['ownerId'], form)

  const seededProject = assessment?.project

  const getProjects = (): OptionsType[] => {
    if (!seededProject || seededProject.id !== projectId || projects.find(d => d.id === seededProject.id)) {
      return projects
    }

    return [...projects, seededProject]
  }

  const {
    data: externalAssessments, fetch: fetchAssessments, isLoading: assessmentIsLoading,
  } = useResources<ExternalAssessment>('external_assessments')

  const {
    data: projects, fetch: fetchProjects, isLoading: projectIsLoading,
  } = useResources<Project>('projects', { basePath: `clients/${ownerId}` })

  const previousOwnerId = useRef(ownerId)
  const previousProjectId = useRef(projectId)

  useEffect(() => {
    if (previousOwnerId.current !== undefined && previousOwnerId.current !== ownerId) {
      form.setFieldsValue({ projectId: undefined })
      form.setFieldValue(['externalSettings', 'assessmentId'], undefined)
      fetchProjects({
        apiConfig: { filter: { has_integration: 'microsite' }, fields: { clients: ['name'] } },
      })
    }
    previousOwnerId.current = ownerId
  }, [ownerId])

  useEffect(() => {
    if (previousProjectId.current !== undefined && previousProjectId.current !== projectId) {
      form.setFieldValue(['externalSettings', 'assessmentId'], undefined)

      if (projectId) {
        fetchAssessments({
          apiConfig: { filter: { type_eq: 'microsite', project_id_eq: projectId } },
        })
      }
    }
    previousProjectId.current = projectId
  }, [projectId])

  return (
    <>
      <Form.Item
        name="projectId"
        label={I18n.t('common.column.project')}
        rules={[{ required: true }]}
      >
        <Select
          disabled={!!assessment}
          showSearch={{
            filterOption: false,
            onSearch: (value) => {
              fetchProjects({
                apiConfig: {
                  filter: { filterable_fields: value, has_integration: 'microsite' },
                  fields: { clients: ['name'] },
                },
              })
            },
          }}
          notFoundContent={projectIsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
        >
          {getProjects().map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name={['externalSettings', 'assessmentId']}
        label={I18n.t('admin.microsite_assessment_name')}
        rules={[{ required: true }]}
      >
        <Select
          disabled={!!assessment}
          showSearch={{
            filterOption: false,
            onSearch: (value) => {
              fetchAssessments({
                apiConfig: { filter: { type_eq: 'microsite', filterable_fields: value, project_id_eq: projectId } },
              })
            },
          }}
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
    </>
  )
}
