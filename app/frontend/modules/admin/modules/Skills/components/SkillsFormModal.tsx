import React, { useEffect, useCallback } from 'react'
import {
  Form, Input, Select, Spin, Switch,
} from 'antd'
import { useParams } from 'react-router'
import { Client } from 'modules/admin/modules/client/core/clients'
import { Tag } from 'modules/admin/core/tags'
import { debounce } from 'lodash'
import { Skill } from '~/modules/admin/modules/client/core/skills'
import { Project } from '~/modules/admin/modules/client/core/projects'
import { useResources } from '~/hooks/useResources'
import { convertEnumToObject } from '~/utils/object'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'
import { SkillCategoryEnum } from '../constants'

const { Option } = Select

type OptionsType = {
  id: string
  name: string
}

type Props = {
  close(): void
  skill?: Skill
}

const { I18n } = window

const MAX_TAG_BATCH_SIZE = 100

export const SkillsFormModal: React.FC<Props> = ({ close, skill }) => {
  const { resource } = useResourceContext<Skill>()
  const [form] = Form.useForm()
  const {
    data: owners, fetch: fetchOwners, isLoading: isOwnerLoading,
  } = useResources<Client>('clients')

  const {
    data: tags, fetch: fetchTags, isLoading: isTagsLoading,
  } = useResources<Tag>('tags', { apiConfig: { query: { taggable_resource_type: TaggableResourceType.Skill } } })

  const params = useParams()

  const ownersLoading = isOwnerLoading('fetch')

  const global = Form.useWatch('global', form)

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

  const createSkill = (data: Skill & {ownerId?: string, global?: boolean}) => {
    if (data.ownerId) {
      delete data.ownerId
    }

    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty('global')) {
      delete data.global
    }

    if (params.projectId) {
      data.project = { id: params.projectId } as {id: string}
    }

    return resource.createResource(data)
  }

  const debouncedFetchTags = useCallback(debounce((value) => {
    fetchTags({
      apiConfig: {
        filter: { name_cont: value },
        fields: { tags: ['name'] },
        page: {
          size: MAX_TAG_BATCH_SIZE,
        },
      },
    })
  }, 300), [])

  const ownerId = Form.useWatch(['ownerId'], form)
  const getProjects = (): OptionsType[] => {
    if (!skill || !skill.project) {
      return projects
    }

    return [...projects, skill.project] as OptionsType[]
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
              <Option key={id} value={id}>{name}</Option>
            ))
          }
        </Select>
      </Form.Item>
    )
  }

  const renderProjectSelector = () => {
    // if already existing Skill and doesn't have project, return null
    if (skill && !skill?.project) {
      return null
    }

    // if global skill, return null
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
          disabled={!!skill}
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
      resourceName="skills"
      resource={skill}
      readableResourceName={I18n.t('administration.skills.form.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: createSkill, updateResource: resource.updateResource }}
      formProps={{
        initialValues: {
          category: SkillCategoryEnum.Behavioral,
        },
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.skills.form.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('administration.skills.form.description')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          {!params.projectId && (
            <>
              {!skill && (
                <>
                  <Form.Item
                    name="global"
                    label={I18n.t('administration.skills.global')}
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
            name="category"
            label={I18n.t('administration.skills.form.category')}
          >
            <Select
              filterOption={false}
            >
              {
                Object.values(convertEnumToObject(SkillCategoryEnum)).map(([key, value]) => (
                  <Option key={value} value={value}>{key}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="tagList"
            label={I18n.t('common.column.tags')}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder={I18n.t('common.column.tags')}
              showSearch
              onSearch={(value) => {
                debouncedFetchTags(value)
              }}
              notFoundContent={isTagsLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
            >
              {tags.map(({ name }) => (
                <Select.Option key={name} value={name}>{name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
