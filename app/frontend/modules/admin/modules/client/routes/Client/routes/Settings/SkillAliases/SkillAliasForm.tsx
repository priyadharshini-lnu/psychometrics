import React from 'react'
import {
  Form, Input,
  Select,
  Spin,
} from 'antd'
import { useDebouncedCallback } from 'use-debounce'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'
import { SkillAlias } from '~/modules/admin/modules/client/core/skillAlias'
import { Skill } from '~/modules/admin/modules/client/core/skills'

const { Option } = Select
interface Props {
  skillAlias?: SkillAlias
  close(): void
}

const { I18n } = window

export const SkillAliasForm: React.FC<Props> = ({
  skillAlias, close,
}) => {
  const { resource } = useResourceContext<SkillAlias>()
  const { data: skills, fetch: fetchSKills, isLoading: isSkillLoading } = useResources<Skill>('skills')
  const skillsOpts = skillAlias?.skill ? skills.concat(skillAlias.skill) : skills

  const handleSkillSearch = useDebouncedCallback((searchKey: string) => {
    fetchSKills({
      apiConfig: { filter: { search_query: searchKey } },
    })
  }, 500)

  return (
    <ResourceFormModal
      resourceName="skillAlias"
      resource={skillAlias}
      readableResourceName={I18n.t('admin.settings_skill_aliases_skill_alias')}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 900 }}
      request={{
        createResource: resource.createResource,
        updateResource: resource.updateResource,
      }}
    >
      {() => (
        <>
          <Form.Item
            name="skillId"
            label={I18n.t('admin.settings_skill_aliases_skill')}
            rules={[{ required: true }]}
          >
            <Select
              placeholder={I18n.t('admin.settings_skill_aliases_select_skill')}
              showSearch={{ filterOption: false, onSearch: handleSkillSearch }}
              notFoundContent={isSkillLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
            >
              {skillsOpts.map(({ id, name }) => (
                <Option key={id} value={id}>
                  {name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label={I18n.t('admin.settings_skill_aliases_alias')}
            rules={[{ required: true }]}
          >
            <Input name="skill_alias_name" placeholder={I18n.t('admin.settings_skill_aliases_alias')} />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
