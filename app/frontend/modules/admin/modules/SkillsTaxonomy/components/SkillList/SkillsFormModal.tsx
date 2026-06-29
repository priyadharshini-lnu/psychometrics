import React, { useCallback } from 'react'
import {
  Form, Input, Select, Spin,
} from 'antd'
import { useParams } from 'react-router'
import { Tag } from 'modules/admin/core/tags'
import { debounce } from 'lodash'
import { Skill } from '~/modules/admin/modules/client/core/skills'
import { useResources } from '~/hooks/useResources'
import { convertEnumToObject } from '~/utils/object'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'
import { SkillTypeEnum } from '../../constants'
import { ApiConfig } from '~/hooks/useResources/interfaces'
import { SkillGroup } from '~/modules/admin/modules/client/core/skillGroups'

const { Option } = Select

type Props = {
  close(): void
  skill?: Skill
}

const { I18n } = window

const MAX_TAG_BATCH_SIZE = 100

export const SkillsFormModal: React.FC<Props> = ({ close, skill }) => {
  const params = useParams()

  const { resource } = useResourceContext<Skill>()
  const [form] = Form.useForm()

  const {
    data: tags, fetch: fetchTags, isLoading: isTagsLoading,
  } = useResources<Tag>('tags', { apiConfig: { query: { taggable_resource_type: TaggableResourceType.Skill } } })

  const {
    data: skillGroups,
    fetch: fetchSkillGroups, isLoading: isSkillGroupsLoading,
  } = useResources<SkillGroup>('skill_groups', {
    apiConfig: {
      filter: { end_level_groups: 'true' },
      project_id: params?.projectId,
    } as ApiConfig,
  })

  const getSkillGroups = () => {
    if (!skillGroups?.length && skill?.skillGroup) {
      return [skill.skillGroup]
    }
    return skillGroups
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

  const debouncedFetchSkillGroups = useCallback(debounce((value) => {
    fetchSkillGroups({
      apiConfig: {
        filter: { name_cont: value },
      },
    })
  }, 300), [])

  const transformValues = (values) => {
    delete values.ownerId
    return {
      ...values,
      project_id: params.projectId,
    }
  }

  return (
    <ResourceFormModal
      resourceName="skills"
      resource={skill}
      readableResourceName={I18n.t('admin.skills_form_title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
      transformValues={transformValues}
      formProps={{
        initialValues: {
          skillType: SkillTypeEnum.Behavioral,
        },
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="skillType"
            label={I18n.t('admin.skills_form_skill_type')}
          >
            <Select
              filterOption={false}
            >
              {
                Object.values(convertEnumToObject(SkillTypeEnum)).map(([key, value]) => (
                  <Option key={value} value={value}>{key}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="skillGroupId"
            label={I18n.t('admin.skills_form_skill_group')}
          >
            <Select
              showSearch={{ filterOption: false, onSearch: debouncedFetchSkillGroups }}
              loading={isSkillGroupsLoading('fetch')}
              notFoundContent={isSkillGroupsLoading('fetch')
                ? <Spin size="small" /> : I18n.t('shared.no_results_found')
            }
              options={getSkillGroups().map(p => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="tagList"
            label={I18n.t('shared.tags')}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder={I18n.t('shared.tags')}
              showSearch={{ filterOption: false, onSearch: debouncedFetchTags }}
              notFoundContent={isTagsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
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
