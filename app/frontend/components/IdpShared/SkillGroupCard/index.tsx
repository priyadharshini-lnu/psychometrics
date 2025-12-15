import { FC, useState, useContext } from 'react'
import { includes, debounce } from 'lodash'
import {
  Avatar, Typography, Select, Row, Col, Flex,
  Spin,
} from 'antd'
import cs from 'classnames'
import {
  PlusCircleOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

import { MediaQueryContext } from '~/glint'
import { TypeWithSkillsSummary, UserIdpSkill } from '../DevelopmentActions'
import styles from './SkillsGroupCard.less'
import { renderSkillTypeIcon } from '../utils'
import { PlanChangeStatus } from '~/modules/endUser/modules/campaigns/core/idp/utils'


type Props = {
  skillType: TypeWithSkillsSummary
  onAddSkill: (skills: { id: number | string; name: string }[]) => void
  onRemoveSkill: (skillId: number) => void
  selectedSkills: UserIdpSkill[],
  isSearching: boolean,
  searchResults: { id: string|number; name: string, skillType: string }[],
  handleSearch: (value: string, skillType: string)=> void
  allowSkillDeletion?:boolean
}

const { I18n } = window
const { Title, Paragraph } = Typography

export const SkillsGroupCard: FC<Props> = ({
  skillType,
  onAddSkill,
  onRemoveSkill,
  selectedSkills,
  handleSearch,
  searchResults,
  isSearching,
  allowSkillDeletion = true,
}) => {
  const [selectedCategorySkills, setSelectedCategorySkills] = useState<
    { skillId: number; id: number | string; name: string; }[]
  >([])

  const { isMobile } = useContext(MediaQueryContext)

  const handleSkillSearch = debounce((value) => {
    if (value.length < 3) return
    handleSearch(value, skillType.skillType)
  }, 300)


  const handleSelectSkill = (skillId) => {
    const skill = searchResults.find(({ id }) => id === skillId)
    if (!skill) return
    const userIdpSkill = { ...skill, skillId }
    onAddSkill([userIdpSkill])
  }

  const handleDeselectSkill = (id) => {
    setSelectedCategorySkills(selectedCategorySkills.filter(({ skillId }) => skillId !== id))
    onRemoveSkill(id)
  }

  const selectedInPlanSkills = selectedSkills.filter(skill => skill.skillType === skillType.skillType
    && skill.changeStatus !== PlanChangeStatus.REMOVED)

  return (
    <>
      <Flex gap={4}>
        <Avatar
          size={64}
          src={renderSkillTypeIcon(skillType.skillType)}
          alt=""
          aria-hidden="true"
          // API changes not available yet
          // src={skillCategory.iconUrl}
        />
        <section style={{ flex: 1 }}>
          <Title className="mb-0 mt-2" level={4}>
            {I18n.t('idp.initial_steps.add_skill_group_title', { category: I18n.t(`idp.${skillType.skillType}`) })}
          </Title>
          <Paragraph>
            {/* API changes not available yet */}
            {/* {skillCategory.description} */}
            {I18n.t('idp.initial_steps.add_skill_group_description')}
          </Paragraph>
        </section>
      </Flex>
      <Title
        aria-label={I18n.t('idp.select_skills_of_skill_type', { skillType: I18n.t(`idp.${skillType.skillType}`) })}
        level={5}
      >
        {I18n.t('idp.initial_steps.select_skills')}
      </Title>
      <Flex
        aria-label={I18n.t('idp.selected_skills_of_skill_type', { skillType: I18n.t(`idp.${skillType.skillType}`) })}
        gap={4}
        wrap
      >
        {selectedInPlanSkills.map(skill => (
          <div
            className={cs(styles.skillBtn)}
            key={skill.id}
          >
            <span className="me-2">
              {skill.name}
            </span>
            {allowSkillDeletion && (
              <CloseOutlined
                role="button"
                tabIndex={0}
                onClick={() => {
                  onRemoveSkill(Number(skill.id))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onRemoveSkill(Number(skill.id))
                  }
                }}
              />
            )}
          </div>
        ))}
      </Flex>
      <Row gutter={isMobile ? [0, 16] : [0, 0]} className="mt-4 mb-4">
        <Col xs={{ span: 24 }} sm={{ span: 16 }}>
          <Select
            className="w-100"
            aria-label={I18n.t('idp.search_and_select_skills_of_skill_type',
              { skillType: I18n.t(`idp.${skillType.skillType}`) })}
            placeholder={I18n.t('idp.initial_steps.select_skills_placeholder')}
            showSearch
            onSearch={handleSkillSearch}
            onSelect={handleSelectSkill}
            notFoundContent={isSearching ? <Spin size="small" /> : null}
            filterOption={false}
            onDeselect={handleDeselectSkill}
            value={null}
          >
            {searchResults
              .filter(result => !includes(selectedInPlanSkills.map(skill => Number(skill.skillId)), Number(result.id)))
              .map(({ id, name }) => (
                <Select.Option
                  key={id}
                  value={id}
                >
                  {name}
                </Select.Option>
              ))}
          </Select>
        </Col>
      </Row>
      <Flex wrap gap={4} className="mb-4">
        {skillType.skills.length > 0 && (
          <Flex align="center">
            <strong
              role="region"
              aria-label={I18n.t('idp.suggestions_for_skill_type', { skillType: I18n.t(`idp.${skillType.skillType}`) })}
            >
              {I18n.t('idp.suggestions')}
            </strong>
          </Flex>
        )}
        {skillType.skills.map(skill => (
          <div
            role="button"
            tabIndex={0}
            className={cs(styles.skillBtn,
              includes(selectedInPlanSkills.map(s => Number(s.skillId)),
                Number(skill.id)) ? styles.skillBtnSuggestionSelected
                : styles.skillBtnSuggestion)}
            key={skill.id}
            onClick={() => {
              if (includes(selectedInPlanSkills.map(s => Number(s.skillId)), Number(skill.id))) {
                onRemoveSkill(Number(skill.id))
                return
              }
              onAddSkill([skill])
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (includes(selectedInPlanSkills.map(s => Number(s.skillId)), Number(skill.id))) {
                  onRemoveSkill(Number(skill.id))
                  return
                }
                onAddSkill([skill])
              }
            }}
          >
            {includes(selectedInPlanSkills.map(s => Number(s.skillId)), Number(skill.id))

              ? (
                <CheckCircleOutlined className="me-2" />
              ) : (
                <PlusCircleOutlined className="me-2" />
              )
            }
            <span>
              {skill.name}
            </span>
          </div>
        ))}
      </Flex>
    </>
  )
}
