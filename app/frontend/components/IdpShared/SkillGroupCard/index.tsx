import { FC, useState, useContext } from 'react'
import { includes, debounce } from 'lodash'
import {
  Space, Avatar, Typography, Select, Row, Col, Flex,
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

type Props = {
  skillType: TypeWithSkillsSummary
  onAddSkill: (skills: { id: number | string; name: string }[]) => void
  onRemoveSkill: (skillId: number) => void
  selectedSkills: UserIdpSkill[],
  isSearching: boolean,
  searchResults: { id: string|number; name: string, skillType: string }[],
  handleSearch: (value: string, skillType: string)=> void
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

  return (
    <>
      <Space>
        <Avatar
          size={64}
          src={renderSkillTypeIcon(skillType.skillType)}
          alt=""
          // API changes not available yet
          // src={skillCategory.iconUrl}
        />
        <div>
          <Title className="mb-0" level={4}>
            {I18n.t('idp.initial_steps.add_skill_group_title', { category: I18n.t(`idp.${skillType.skillType}`) })}
          </Title>
          <Paragraph>
            {/* API changes not available yet */}
            {/* {skillCategory.description} */}
            {I18n.t('idp.initial_steps.add_skill_group_description')}
          </Paragraph>
        </div>
      </Space>
      <Title level={5}>{I18n.t('idp.initial_steps.select_skills')}</Title>
      <Flex gap={4} wrap>
        {selectedSkills.filter(skill => skill.skillType === skillType.skillType).map(skill => (
          <div
            className={styles['skill-btn']}
            key={skill.id}
          >
            <span style={{ marginRight: '4px' }}>
              {skill.name}
            </span>
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
          </div>
        ))}
      </Flex>
      <Row gutter={isMobile ? [0, 16] : [0, 0]} className="mt-4 mb-4">
        <Col xs={{ span: 24 }} sm={{ span: 16 }}>
          <Select
            className="w-100"
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
              .filter(result => !includes(selectedSkills
                .map(skill => skill.skillId), result.id))
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
        <Flex align="center">
          <strong>{I18n.t('idp.suggestions')}</strong>
        </Flex>
        {skillType.skills.map(skill => (
          <div
            role="button"
            tabIndex={0}
            className={cs(styles['skill-btn'],
              includes(selectedSkills.map(s => s.skillId), skill.id) ? styles['skill-btn-suggestion-selected']
                : styles['skill-btn-suggestion'])}
            key={skill.id}
            onClick={() => {
              if (includes(selectedSkills.map(s => s.skillId), skill.id)) {
                onRemoveSkill(Number(skill.id))
                return
              }
              onAddSkill([skill])
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (includes(selectedSkills.map(s => s.skillId), skill.id)) {
                  onRemoveSkill(Number(skill.id))
                  return
                }
                onAddSkill([skill])
              }
            }}
          >
            {includes(selectedSkills.map(s => s.skillId), skill.id)

              ? (
                <CheckCircleOutlined className="mr4" />
              ) : (
                <PlusCircleOutlined className="mr4" />
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
