import { useCallback } from 'react'
import {
  Form, Select, Radio, FormInstance,
} from 'antd'
import debounce from 'lodash/debounce'
import { useResources } from '~/hooks/useResources'
import { Skill as SkillType } from '~/modules/admin/modules/client/core/skills'

const { I18n } = window
const { Option } = Select

type Skill = Pick<SkillType, 'id' | 'name'>;

const SkillsOption = {
  NONE: 'none',
  ALL: 'all',
  SELECTED: 'selected',
}

type filterType = {
    name_cont: string,
    category_in:string,
    project_id_eq?: string,
    global?: string
}

type Props = {
  category: 'behavioral' | 'technical',
  type: 'Global' | 'Client',
  projectId?: string,
  form: FormInstance,
}

const SkillsAndTagsSelection = ({
  category, type, projectId, form,
}:Props) => {
  const { fetch: fetchSkillsTag, data: skillsByTagSearchData } = useResources<Skill>('tags_search',
    { basePath: 'skills' })
  const { fetch: fetchSpecificSkills, data: specificSkillsSearchData } = useResources<Skill>('skills')
  const frmName = `${category}_${type.toLowerCase()}`
  const nameSkillsOption = `${frmName}_value`
  const selectedSkillOption = Form.useWatch(nameSkillsOption, form)

  const searchSkillsHandler = useCallback(
    debounce((query, isSpecific) => {
      const filter: filterType = {
        name_cont: query,
        category_in: category,
      }

      if (projectId) {
        filter.project_id_eq = projectId
      } else if (isSpecific) {
        filter.global = 'true'
      }
      if (query.length < 3) return
      isSpecific ? fetchSpecificSkills({ apiConfig: { filter } }) : fetchSkillsTag({ apiConfig: { filter } })
    }, 300),
    [category],
  )

  return (
    <div key={type} className="mb8">
      <Form.Item
        label={I18n.t(`administration.idp.${type.toLowerCase()}_skills`)}
        name={nameSkillsOption}
        initialValue={SkillsOption.NONE}
      >
        <Radio.Group>
          <Radio value={SkillsOption.NONE}>{I18n.t('administration.idp.none')}</Radio>
          <Radio value={SkillsOption.ALL}>{I18n.t('administration.idp.all')}</Radio>
          <Radio value={SkillsOption.SELECTED}>{I18n.t('administration.idp.selected')}</Radio>
        </Radio.Group>
      </Form.Item>
      {selectedSkillOption === SkillsOption.SELECTED && (
        <>
          <Form.Item label={I18n.t('administration.idp.select_by_tags')} name={`${frmName}_tags`}>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder={I18n.t('administration.idp.select_by_tags')}
              onSearch={(query) => {
                searchSkillsHandler(query, false)
              }}
              filterOption={false}
            >
              {skillsByTagSearchData.map(skill => (
                <Option key={skill.id} value={skill.id}>{skill.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={I18n.t('administration.idp.select_specific_skills')}
            name={`${frmName}_skills`}
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
              {specificSkillsSearchData.map(skill => (
                <Option key={skill.id} value={skill.id}>{skill.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </div>
  )
}

export default SkillsAndTagsSelection
