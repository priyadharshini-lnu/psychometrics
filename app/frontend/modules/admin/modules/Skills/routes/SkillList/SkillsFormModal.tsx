import React, { useEffect, useCallback } from 'react'
import {
  Form, Input, Select, Spin,
} from 'antd'
import { Skill } from 'modules/admin/modules/client/core/skill'
import { Client } from 'modules/admin/modules/client/core/clients'
import { Tag } from 'modules/admin/core/tags'
import { debounce } from 'lodash'
import { useResources } from '~/hooks/useResources'
import { convertEnumToObject } from '~/utils/object'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'
import { SkillCategoryEnum } from './constants'

const { Option } = Select
type Props = {
  close(): void
  skill?: Skill
}

const { I18n } = window

const MAX_TAG_BATCH_SIZE = 100

export const SkillsFormModal: React.FC<Props> = ({ close, skill }) => {
  const { resource } = useResourceContext()
  const [form] = Form.useForm()
  const {
    data: owners, fetch: fetchOwners, isLoading: isOwnerLoading,
  } = useResources<Client>('clients')

  const {
    data: tags, fetch: fetchTags, isLoading: isTagsLoading,
  } = useResources<Tag>('tags', { apiConfig: { query: { taggable_resource_type: TaggableResourceType.Skill } } })

  const ownersLoading = isOwnerLoading('fetch')

  const ownerOpts = skill?.owner ? owners.concat(skill.owner) : owners

  const fetchOwnersByValue = (value: string) => fetchOwners({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })

  const searchAvailableOwners = debounce((value) => {
    fetchOwnersByValue(value)
  }, 50)


  useEffect(() => {
    fetchOwnersByValue('')
    fetchTags({
      apiConfig: {
        filter: { name_cont: '' },
        fields: { tags: ['name'] },
        page: {
          size: MAX_TAG_BATCH_SIZE,
        },
      },
    })
  }, [])

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

  return (
    <ResourceFormModal
      resourceName="skill"
      resource={skill}
      readableResourceName={I18n.t('administration.skills.form.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.skills.form.name')}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('administration.skills.form.description')}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ownerId"
            label={I18n.t('administration.campaign_templates.form.owner')}
          >
            <Select
              showSearch
              filterOption={false}
              placeholder={
                  I18n.t('administration.campaign_templates.form.owner_placeholder')
                }
              onSearch={searchAvailableOwners}
              notFoundContent={ownersLoading ? <Spin size="small" /> : null}
            >
              {
                ownerOpts.map(({ id, name }) => (
                  <Option key={id} value={id}>{name}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label={I18n.t('administration.skills.form.category')}
          >
            <Select
              filterOption={false}
              defaultValue={skill?.category ? skill.category : SkillCategoryEnum.Behavioral}
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
