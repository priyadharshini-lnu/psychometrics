import React from 'react'
import {
  Form, Select, Input,
} from 'antd'
import { FormInstance } from 'antd/es/form'
import { useResources } from '~/hooks/useResources'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { Project } from '~/modules/admin/modules/client/core/projects'

const { I18n } = window

type OptionsType = {
  id: string
  name: string
}

export const YoodliFields: React.FC<{
  form: FormInstance, assessment: Assessment
}> = (
  { form, assessment },
) => {
  const ownerId = Form.useWatch(['ownerId'], form)

  const getProjects = (): OptionsType[] => {
    if (!assessment || !assessment.project || projects.find(d => assessment?.owner?.id === d.id)) {
      return projects
    }

    return [...projects, assessment.project]
  }

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
          showSearch={{
            filterOption: false,
            onSearch: (value) => {
              fetchProjects({
                apiConfig: {
                  filter: { filterable_fields: value, has_integration: 'yoodli' },
                  fields: { clients: ['name'] },
                },
              })
            },
          }}
          notFoundContent={projectIsLoading('fetch') ? 'Loading...' : null}
        >
          {getProjects().map(({ id, name }) => (
            <Select.Option key={id} value={id}>{name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name={['externalSettings', 'assessmentId']}
        label={I18n.t('assessments.column.external_settings.yoodli_scenario_id')}
        rules={[{ required: true }]}
      >
        <Input
          disabled={!!assessment}
        />
      </Form.Item>
    </>
  )
}
