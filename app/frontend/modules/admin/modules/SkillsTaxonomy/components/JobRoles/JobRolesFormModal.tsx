import React, { useCallback, useEffect } from 'react'
import {
  Form, Input, Select,
  Spin,
  Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { JobRole } from '~/modules/admin/modules/client/core/jobRoles'
import { JobGroup } from '~/modules/admin/modules/client/core/jobGroups'
import { ApiConfig } from '~/hooks/useResources/interfaces'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { Project } from '~/modules/admin/modules/client/core/projects'

type OptionsType = {
  id: string
  name: string
}

type Props = {
  close(): void
  jobRole: JobRole
}

const { I18n } = window

export const JobRolesFormModal: React.FC<Props> = ({ close, jobRole }) => {
  const params = useParams()

  const { resource } = useResourceContext<JobRole>()
  const [form] = Form.useForm()
  const {
    data: owners, fetch: fetchOwners, isLoading: isOwnerLoading,
  } = useResources<Client>('clients')

  const global = Form.useWatch('global', form)
  const projectId = Form.useWatch('projectId', form)

  const {
    data: jobGroups,
    fetch: fetchJobGroups, isLoading: isJobGroupsLoading, setData: setJobGroups,
  } = useResources<JobGroup>('job_groups', {
    apiConfig: {
      filter: {
        end_level_groups: 'true',
      },
      ...(params?.projectId ? { project_id: params?.projectId } : {}),
    } as ApiConfig,
  })

  const shouldFetchDependent = useCallback(
    () => (global || params.projectId || projectId),
    [global, projectId, params],
  )
  const getJobGroups = (): JobGroup[] => {
    if (!jobGroups?.length && jobRole?.jobGroup) {
      return [jobRole.jobGroup]
    }
    return jobGroups
  }

  const debouncedFetchJobGroups = useCallback(debounce((value) => {
    if (!shouldFetchDependent()) return
    fetchJobGroups({
      apiConfig: {
        filter: {
          name_cont: value,
          ...(
            (projectId) ? { project_id: projectId } : {}
          ),
        },
      },
    })
  }, 300), [projectId, shouldFetchDependent])

  const ownersLoading = isOwnerLoading('fetch')

  const fetchOwnersByValue = (value: string) => fetchOwners({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })

  const searchAvailableOwners = debounce((value) => {
    fetchOwnersByValue(value)
  }, 300)

  useEffect(() => {
    form.resetFields(['ownerId'])
  }, [global])

  useEffect(() => {
    setJobGroups([])
    form.resetFields(['jobGroupId'])
  }, [global, projectId])

  const ownerId = Form.useWatch(['ownerId'], form)

  const getProjects = (): OptionsType[] => {
    if (!projects?.length && jobRole?.project) {
      return [jobRole.project] as OptionsType[]
    }
    return projects
  }

  const {
    data: projects, fetch: fetchProjects, isLoading: projectIsLoading, setData: setProjects,
  } = useResources<Project>('projects', { basePath: `clients/${ownerId}` })

  useEffect(() => {
    setProjects([])
    form.resetFields(['projectId'])
  }, [ownerId])

  const handleProjectSearch = debounce((value) => {
    fetchProjects({
      apiConfig: {
        filter: { filterable_fields: value },
        fields: { clients: ['name'] },
      },
    })
  }, 300)

  const transformValues = (values) => {
    delete values.global
    delete values.ownerId
    return {
      ...values,
      project_id: (params.projectId || values.projectId)
        ? Number(params.projectId || values.projectId)
        : undefined,
      job_group_id: Number(values.jobGroupId),
    }
  }

  const renderClientSelector = () => {
    if (global) return null
    return (
      <Form.Item
        name="ownerId"
        label={I18n.t('common.column.client')}
        rules={[{ required: true }]}
      >
        <Select
          showSearch
          filterOption={false}
          placeholder={I18n.t('administration.skills.form.client_placeholder')}
          onSearch={searchAvailableOwners}
          notFoundContent={ownersLoading ? <Spin size="small" /> : null}
        >
          {
            owners.map(({ id, name }) => (
              <Select.Option key={id} value={id}>{name}</Select.Option>
            ))
          }
        </Select>
      </Form.Item>
    )
  }

  const renderProjectSelector = () => {
    if (jobRole && !jobRole?.project) {
      return null
    }

    if (global) {
      return null
    }

    return (
      <Form.Item
        name="projectId"
        label={I18n.t('common.column.project')}
        rules={[{ required: true }]}
      >
        <Select
          showSearch
          filterOption={false}
          disabled={!!jobRole}
          onSearch={handleProjectSearch}
          options={(getProjects() || []).map(p => ({
            value: p.id,
            label: p.name,
          }))}
          placeholder={I18n.t('administration.skills.form.project_placeholder')}
          value={form.getFieldValue('projectId')}
          notFoundContent={projectIsLoading('fetch') ? <Spin size="small" /> : null}
        />
      </Form.Item>
    )
  }

  return (
    <ResourceFormModal
      resourceName="jobRole"
      resource={jobRole ? transformValues(jobRole) : undefined}
      readableResourceName={I18n.t('administration.job_role.form.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
      transformValues={transformValues}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.job_role.form.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label={I18n.t('administration.job_role.form.code')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('administration.job_role.form.description')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          {!params.projectId && (
            <>
              {!jobRole && (
                <>
                  <Form.Item
                    name="global"
                    label={I18n.t('administration.job_role.global')}
                  >
                    <Switch />
                  </Form.Item>
                  {renderClientSelector()}
                </>
              )}
              {renderProjectSelector()}
            </>
          )}
          <Form.Item
            name="jobGroupId"
            label={I18n.t('administration.job_role.form.job_group')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              allowClear
              filterOption={false}
              loading={isJobGroupsLoading('fetch')}
              onSearch={(value) => {
                debouncedFetchJobGroups(value)
              }}
              notFoundContent={isJobGroupsLoading('fetch') ? <Spin size="small" /> : null}
              options={getJobGroups().map(p => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
