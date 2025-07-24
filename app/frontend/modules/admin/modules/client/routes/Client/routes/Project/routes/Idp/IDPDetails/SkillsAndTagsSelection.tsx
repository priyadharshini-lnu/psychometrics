import { useCallback } from 'react'
import {
  Form, Select, Radio, FormInstance,
} from 'antd'
import debounce from 'lodash/debounce'
import {
  CategorizedSkills,
} from './SkillsForm'
import { useResources } from '~/hooks/useResources'
import { Skill as SkillType } from '~/modules/admin/modules/client/core/skills'

const { I18n } = window
const { Option } = Select

type Skill = Pick<SkillType, 'id' | 'name'>;

export const SkillsOption = {
  NONE: 'none',
  ALL: 'all',
  SELECTED: 'selected',
}

type filterType = {
    name_cont: string,
    skill_type_in:string,
    project_id_eq?: string,
    global?: string
}

type Props = {
  skillType: 'behavioral' | 'technical',
  type: 'Global' | 'Client',
  projectId?: string,
  form: FormInstance,
  categorizedSkills:CategorizedSkills
}

const SkillsAndTagsSelection = ({
  skillType, type, projectId, form, categorizedSkills,
}:Props) => {
  const { fetch: fetchSkillsTag, data: skillsByTagSearchData } = useResources<Skill>('tags_search',
    { basePath: 'skills' })
  const { fetch: fetchSpecificSkills, data: specificSkillsSearchData } = useResources<Skill>('skills')
  const settingPrefix = `${skillType}${type}`
  const nameSkillsOption = `${settingPrefix}SkillSettings`
  const selectedSkillOption = Form.useWatch(nameSkillsOption, form)
  const searchSkillsHandler = useCallback(
    debounce((query, isSpecific) => {
      const filter: filterType = {
        name_cont: query,
        skill_type_in: skillType,
      }

      if (projectId) {
        filter.project_id_eq = projectId
      } else if (isSpecific) {
        filter.global = 'true'
      }
      if (query.length < 3) return
      isSpecific ? fetchSpecificSkills({ apiConfig: { filter } }) : fetchSkillsTag({ apiConfig: { filter } })
    }, 300),
    [skillType],
  )

  const skills = categorizedSkills ? (specificSkillsSearchData || [])
    .concat(categorizedSkills[`${settingPrefix}Skills`])
    : specificSkillsSearchData

  const checkTagAndSkillsSelected = async () => {
    const tags = form.getFieldValue(`${settingPrefix}Tags`) || []
    const skillsSelected = form.getFieldValue(`${settingPrefix}Skills`) || []
    if (tags.length === 0 && skillsSelected.length === 0) {
      form.setFields([{
        name: `${settingPrefix}SkillsAndTags`,
        errors: [I18n.t('administration.idp.enter_tag_or_skills_error')],
      }])
      return Promise.reject()
    }
    form.setFields([{
      name: `${settingPrefix}SkillsAndTags`,
      errors: [''],
    }])
    return Promise.resolve()
  }

  return (
    <div key={type} className="mb8">
      <Form.Item
        label={I18n.t(`administration.idp.${type.toLowerCase()}_skills`)}
        name={nameSkillsOption}
      >
        <Radio.Group>
          <Radio value={SkillsOption.NONE}>{I18n.t('administration.idp.none')}</Radio>
          <Radio value={SkillsOption.ALL}>{I18n.t('administration.idp.all')}</Radio>
          <Radio value={SkillsOption.SELECTED}>{I18n.t('administration.idp.selected')}</Radio>
        </Radio.Group>
      </Form.Item>

      {selectedSkillOption === SkillsOption.SELECTED && (
        <Form.Item
          name={`${settingPrefix}SkillsAndTags`}
          shouldUpdate
          validateTrigger={['onChange']}
          dependencies={[`${settingPrefix}Tags`, `${settingPrefix}Skills`]}
        >
          <Form.Item
            label={I18n.t('administration.idp.select_by_tags')}
            name={`${settingPrefix}Tags`}
            rules={[{ validator: checkTagAndSkillsSelected }]}
          >
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder={I18n.t('administration.idp.select_by_tags')}
              onSearch={(query) => {
                searchSkillsHandler(query, false)
              }}
              filterOption={false}
            >
              {skillsByTagSearchData.map(tag => (
                <Option key={tag.id} value={tag.name}>{tag.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={I18n.t('administration.idp.select_specific_skills')}
            name={`${settingPrefix}Skills`}
            rules={[{ validator: checkTagAndSkillsSelected }]}
            style={{ marginBottom: '4px' }}
          >
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder={I18n.t('administration.idp.select_specific_skills')}
              onSearch={(query) => {
                searchSkillsHandler(query, true)
              }}
              filterOption={false}
            >
              {skills?.map(skill => (
                <Option key={skill.id} value={skill.id}>{skill.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form.Item>
      )}
    </div>
  )
}

export default SkillsAndTagsSelection
