import { FC, useState, useContext } from 'react'
import _ from 'lodash'
import {
  Space, Avatar, Typography, Button, Select, Row, Col,
  Spin,
} from 'antd'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import { connect } from 'react-redux'
import { BoxWithShadow, ButtonWithArrow, MediaQueryContext } from '~/glint'
import { CategoryWithSkillsSummary, UserIdpSkill } from '../DevelopmentActions'
import {
  fetchIdpSkills,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { RootState } from '~/modules/endUser/core/rootReducers'

import styles from './SkillsGroupCard.less'
import { renderSkillCategoryIcon } from '../utils'

const connector = connect((state: RootState) => ({
  userIdpSkills: state.campaigns.idp.userIdpSkills,
}),
{
  fetchIdpSkills,
})

type Props = {
  skillCategory: CategoryWithSkillsSummary
  onAddSkill: (skills: { id: number; name: string }[]) => void
  fetchIdpSkills: (filters: object) => Promise<{ response: { id: number; name: string, category: string }[]}>
  onRemoveSkill: (skillId: number) => void
  selectedSkills: UserIdpSkill[]
}

const { I18n } = window
const { Title, Paragraph } = Typography

const SkillsGroupCardComponent: FC<Props> = ({
  skillCategory,
  onAddSkill,
  fetchIdpSkills,
  onRemoveSkill,
  selectedSkills,
}) => {
  const [searchResults, setSearchResults] = useState<{ id: number; name: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCategorySkills, setSelectedCategorySkills] = useState<
    { skillId: number; id: number; name: string; }[]
  >([])
  const { isMobile } = useContext(MediaQueryContext)

  const handleSearch = _.debounce((value) => {
    setIsSearching(true)
    fetchIdpSkills({
      filterByCategory: skillCategory.category,
      nameCont: value,
    }).then(({ response }) => {
      setIsSearching(false)
      setSearchResults(response)
    })
  }, 300)

  const handleSelectSkill = (skillId) => {
    const skill = searchResults.find(({ id }) => id === skillId)
    if (!skill) return

    const userIdpSkill = { ...skill, skillId }

    setSelectedCategorySkills(_.uniqBy([...selectedCategorySkills, userIdpSkill], 'skillId'))
  }

  const handleDeselectSkill = (id) => {
    setSelectedCategorySkills(selectedCategorySkills.filter(({ skillId }) => skillId !== id))
    onRemoveSkill(id)
  }

  const isAddSelectedCategorySkillsDisabled = _.every(selectedCategorySkills,
    categorySkill => _.includes(selectedSkills.map(skill => skill.skillId), categorySkill.skillId))

  return (
    <BoxWithShadow style={{ padding: '24px 24px' }}>
      <Space className={`${styles.heading} w-100`}>
        <Avatar
          size={64}
          src={renderSkillCategoryIcon(skillCategory.category)}
          // API changes not available yet
          // src={skillCategory.iconUrl}
        />
        <div>
          <Title className="mb-0" level={4}>
            {I18n.t('idp.initial_steps.add_skill_group_title', { category: _.capitalize(skillCategory.category) })}
          </Title>
          <Paragraph>
            {/* API changes not available yet */}
            {/* {skillCategory.description} */}
            {I18n.t('idp.initial_steps.add_skill_group_description')}
          </Paragraph>
        </div>
      </Space>
      <Title level={5}>{I18n.t('idp.initial_steps.select_skills')}</Title>
      <Space className="w-100" size="large" direction="vertical">
        <Space wrap>
          {skillCategory.skills.map(skill => (
            <Button onClick={() => onAddSkill([skill])} size="small" type="primary" key={skill.name} ghost>
              {skill.name}
            </Button>
          ))}
        </Space>
        <MoreSkillsContainer>
          <Row gutter={isMobile ? [0, 16] : [0, 0]} className="mt-4">
            <Col xs={{ span: 24 }} sm={{ span: 16 }}>
              <Select
                className="w-100"
                placeholder={I18n.t('idp.initial_steps.select_skills_placeholder')}
                showSearch
                onSearch={handleSearch}
                mode="multiple"
                onSelect={handleSelectSkill}
                notFoundContent={isSearching ? <Spin size="small" /> : null}
                filterOption={false}
                onDeselect={handleDeselectSkill}
              >
                {searchResults.map(({ id, name }) => (
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
          <Row justify="end">
            <ButtonWithArrow
              onClick={() => onAddSkill(selectedCategorySkills)}
              disabled={isAddSelectedCategorySkillsDisabled}
              size="small"
              type="primary"
              label={I18n.t('idp.initial_steps.add_skills')}
            />
          </Row>
        </MoreSkillsContainer>
      </Space>
    </BoxWithShadow>
  )
}

const MoreSkillsContainer = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true)

  if (collapsed) {
    return (
      <Button className="ps-0" ghost type="link" onClick={() => setCollapsed(false)}>
        <PlusOutlined />
        {I18n.t('idp.initial_steps.more_skills')}
      </Button>
    )
  }
  return (
    <Space className="w-100" direction="vertical" size={12}>
      <Button className="ps-0" ghost type="link" onClick={() => setCollapsed(true)}>
        <CloseOutlined />
        {I18n.t('idp.initial_steps.less_skills')}
      </Button>
      {children}
    </Space>
  )
}

export const SkillsGroupCard = connector(SkillsGroupCardComponent)
