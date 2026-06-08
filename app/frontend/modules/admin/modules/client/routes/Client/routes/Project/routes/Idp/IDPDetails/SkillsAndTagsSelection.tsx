import { useCallback } from 'react'
import {
  Form, Select, Radio, FormInstance, Badge,
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
interface Tag {
  id: string;
  name: string;
  taggingsCount: number;
}

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
  const { fetch: fetchSkillsTag, data: skillsByTagSearchData } = useResources<Tag>('tags_search',
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

      if (type === 'Global') {
        filter.global = 'true'
      } else if (projectId) {
        filter.project_id_eq = projectId
      }

      if (query.length < 3) return

      const apiConfig: { filter: filterType; query?: { project_id: string } } = { filter }
      if (type === 'Global' && projectId) {
        apiConfig.query = { project_id: projectId }
      }

      isSpecific ? fetchSpecificSkills({ apiConfig }) : fetchSkillsTag({ apiConfig })
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
        errors: [I18n.t('admin.idp_enter_tag_or_skills_error')],
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
        label={I18n.t(`admin.idp_${type.toLowerCase()}_skills`)}
        name={nameSkillsOption}
      >
        <Radio.Group>
          <Radio value={SkillsOption.NONE}>{I18n.t('admin.idp_none')}</Radio>
          <Radio value={SkillsOption.ALL}>{I18n.t('admin.idp_all')}</Radio>
          <Radio value={SkillsOption.SELECTED}>{I18n.t('admin.idp_selected')}</Radio>
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
            label={I18n.t('admin.idp_select_by_tags')}
            name={`${settingPrefix}Tags`}
            rules={[{ validator: checkTagAndSkillsSelected }]}
          >
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder={I18n.t('admin.idp_select_by_tags')}
              showSearch={{
                filterOption: false,
                onSearch: (query) => {
                  searchSkillsHandler(query, false)
                },
              }}
            >
              {skillsByTagSearchData.map(tag => (
                <Option key={tag.id} value={tag.name}>
                  {tag.name}
                  {' '}
                  <Badge color="volcano" overflowCount={99} offset={[0, -2]} count={tag.taggingsCount} size="small" />
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={I18n.t('admin.idp_select_specific_skills')}
            name={`${settingPrefix}Skills`}
            rules={[{ validator: checkTagAndSkillsSelected }]}
            style={{ marginBottom: '4px' }}
          >
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder={I18n.t('admin.idp_select_specific_skills')}
              showSearch={{
                filterOption: false,
                onSearch: (query) => {
                  searchSkillsHandler(query, true)
                },
              }}
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
