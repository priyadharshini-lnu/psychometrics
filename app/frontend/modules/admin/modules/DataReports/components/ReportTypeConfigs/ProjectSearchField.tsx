import React, { useEffect, useState } from 'react'
import { Form, Select, Spin } from 'antd'
import { useResources } from '~/hooks/useResources'
import { Project } from '~/modules/admin/modules/client/core/projects'
import { ScopeType } from './types'

const { I18n } = window

interface Props {
  scope: ScopeType
  ownerId: string | null
  parsedConfiguration: Record<string, unknown> | null
  required?: boolean
}

const ProjectSearchField: React.FC<Props> = ({
  scope,
  ownerId,
  parsedConfiguration,
  required,
}) => {
  const isRequired = required !== undefined ? required : scope === 'client'

  const {
    collectionAction: searchProjects,
    isLoading: isSearchingProjects,
  } = useResources<Project>('data_reports')

  const [searchValue, setSearchValue] = useState('')
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    if (scope === 'client' && !ownerId) {
      setProjects([])
      return
    }

    searchProjects({
      action: 'search_project',
      method: 'get',
      body: {
        client_id: scope === 'client' ? ownerId : undefined,
        filter: searchValue
          ? {
            name_cont: searchValue,
            id_as_text_cont: searchValue,
            m: 'or',
          }
          : {},
      },
    }).then((response) => {
      setProjects(response as Project[])
    })
  }, [scope, ownerId, searchValue])
  if (scope === 'client' && !ownerId) {
    return null
  }

  return (
    <Form.Item
      name="projectIds"
      label={I18n.t('admin.projects')}
      initialValue={
        (parsedConfiguration?.project_ids as Array<string | number>)?.map(String) || []
      }
      rules={[
        {
          required: isRequired,
          message: I18n.t('admin.select_projects_required'),
        },
      ]}
    >
      <Select
        mode="multiple"
        showSearch
        filterOption={false}
        placeholder={I18n.t('admin.select_projects')}
        onSearch={setSearchValue}
        notFoundContent={
          isSearchingProjects('get/search_project')
            ? <Spin size="small" />
            : I18n.t('shared.no_results_found')
        }
      >
        {projects.map(({ id, name }) => (
          <Select.Option
            key={id}
            value={String(id)}
          >
            {name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  )
}

export default ProjectSearchField
