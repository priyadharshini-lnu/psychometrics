import React, { useCallback, useEffect } from 'react'
import {
  Form, Select, Spin, Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash'
import { Skill } from '~/modules/admin/modules/client/core/skills'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { JobRole } from '~/modules/admin/modules/client/core/jobRoles'
import { JobRoleSkillMapping } from '~/modules/admin/modules/client/core/jobRoleSkillMappings'
import { ApiConfig } from '~/hooks/useResources/interfaces'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { Project } from '~/modules/admin/modules/client/core/projects'

type OptionsType = {
  id: string
  name: string
}

type Props = {
  close(): void
  mapping: JobRoleSkillMapping
}

const { I18n } = window

export const MappingModal: React.FC<Props> = ({ close, mapping }) => {
  const params = useParams()

  const { resource } = useResourceContext<JobRoleSkillMapping>()
  const [form] = Form.useForm()

  const global = Form.useWatch('global', form)
  const selectedProjectId = Form.useWatch('projectId', form)

  const {
    data: owners, fetch: fetchOwners, isLoading: isOwnerLoading,
  } = useResources<Client>('clients')

  const shouldFetchDependent = useCallback(
    () => (global || params.projectId || selectedProjectId),
    [global, params, selectedProjectId],
  )

  const {
    data: jobRoles,
    fetch: fetchJobRoles, isLoading: isJobRolesLoading, setData: setJobRoles,
  } = useResources<JobRole>('job_roles', {
    apiConfig: {
      filter: {
        // end_level_groups: 'true',
        ...(selectedProjectId ? { project_id_eq: selectedProjectId } : {}),
        ...(global ? { global: 'true' } : {}),
      },
      ...(params?.projectId ? { project_id: params?.projectId } : {}),
    } as ApiConfig,
  })

  const debouncedFetchJobRoles = useCallback(debounce((value) => {
    if (!shouldFetchDependent()) return
    fetchJobRoles({
      apiConfig: {
        filter: {
          name_or_code_cont: value,
          ...(selectedProjectId ? { project_id_eq: selectedProjectId } : {}),
          ...(global ? { global: 'true' } : {}),
        },
      },
    })
  }, 300), [selectedProjectId, global, shouldFetchDependent])

  const {
    data: skills,
    fetch: fetchSkills, isLoading: isSkillsLoading, setData: setSkills,
  } = useResources<Skill>('skills', {
    apiConfig: {
      filter: {
        ...(params?.projectId ? { project_id_eq: params?.projectId } : {}),
        ...(selectedProjectId ? { project_id_eq: selectedProjectId } : {}),
        ...(global ? { global: 'true' } : {}),
      },
    },
  })

  const debouncedFetchSkills = useCallback(debounce((value) => {
    if (!shouldFetchDependent()) return
    fetchSkills({
      apiConfig: {
        filter: {
          name_cont: value,
          ...(selectedProjectId ? { project_id_eq: selectedProjectId } : {}),
          ...(global ? { global: 'true' } : {}),
        },
      },
    })
  }, 300), [selectedProjectId, global, shouldFetchDependent])


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

  const ownerId = Form.useWatch(['ownerId'], form)

  const getProjects = (): OptionsType[] => {
    if (!projects?.length && mapping?.project) {
      return [mapping.project] as OptionsType[]
    }
    return projects
  }

  const getJobRoles = (): JobRole[] => {
    if (!jobRoles?.length && mapping?.jobRole) {
      return [mapping.jobRole]
    }
    return jobRoles
  }

  const getSkills = (): Skill[] => {
    if (!skills?.length && mapping?.skill) {
      return [mapping.skill]
    }
    return skills
  }

  const {
    data: projects, fetch: fetchProjects, isLoading: projectIsLoading, setData: setProjects,
  } = useResources<Project>('projects', { basePath: `clients/${ownerId}` })

  useEffect(() => {
    setProjects([])
    form.resetFields(['projectId'])
  }, [ownerId])

  useEffect(() => {
    setSkills([])
    setJobRoles([])
    form.resetFields(['skillId', 'jobRoleId'])
  }, [selectedProjectId, global])

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
      project_id: (params.projectId || values.projectId) ? Number(params.projectId || values.projectId) : null,
      job_role_id: Number(values.jobRoleId),
      skill_id: Number(values.skillId),
      expected_proficiency_level: Number(values.expectedProficiencyLevel),
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
    if (mapping && !mapping?.project) {
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
          disabled={!!mapping}
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
      resourceName="mapping"
      resource={mapping ? transformValues(mapping) : undefined}
      readableResourceName={I18n.t('administration.job_role_skill_mapping.form.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{
        createResource: resource.createResource,
        updateResource: resource.updateResource,
      }}
      transformValues={transformValues}
    >
      {() => (
        <>
          {!params.projectId && (
            <>
              {!mapping && (
                <>
                  <Form.Item
                    name="global"
                    label={I18n.t('administration.job_role_skill_mapping.global')}
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
            name="jobRoleId"
            label={I18n.t('administration.job_role_skill_mapping.form.job_role')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              loading={isJobRolesLoading('fetch')}
              onSearch={(value) => {
                debouncedFetchJobRoles(value)
              }}
              notFoundContent={isJobRolesLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
              options={getJobRoles().map(p => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="skillId"
            label={I18n.t('administration.job_role_skill_mapping.form.skill')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              loading={isSkillsLoading('fetch')}
              onSearch={(value) => {
                debouncedFetchSkills(value)
              }}
              notFoundContent={isSkillsLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
              options={getSkills().map(p => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="expectedProficiencyLevel"
            label={I18n.t('administration.job_role_skill_mapping.form.expected_proficiency_level')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
            >
              {Array.from({ length: 6 })?.map((_, index: number) => (
                <Select.Option key={index} value={index}>{index}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
