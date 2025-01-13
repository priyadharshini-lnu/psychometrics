import React, { useEffect } from 'react'
import {
  Form, Input, Select, Spin,
} from 'antd'
import { Skill } from 'modules/admin/modules/client/core/skill'
import { Client } from 'modules/admin/modules/client/core/clients'
import { debounce } from 'lodash'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'


const { Option } = Select
type Props = {
  close(): void
  skill?: Skill
}

const { I18n } = window

export const SkillsFormModal: React.FC<Props> = ({ close, skill }) => {
  const { resource } = useResourceContext()
  const [form] = Form.useForm()
  const {
    data: owners, fetch: fetchOwners, isLoading: isOwnerLoading,
  } = useResources<Client>('clients')
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
  }, [])

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
        </>
      )}
    </ResourceFormModal>
  )
}
