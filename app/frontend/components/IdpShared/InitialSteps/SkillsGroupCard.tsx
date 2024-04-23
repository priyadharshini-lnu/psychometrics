import { FC, useState, useContext } from 'react'
import {
  Space, Avatar, Typography, Button, Radio, Select, Row, Col,
} from 'antd'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import { BoxWithShadow, ButtonWithArrow, MediaQueryContext } from '~/glint'
import { type CategoryWithSkills } from '../DevelopmentActions'

import styles from './SkillsGroupCard.less'

// sample data
const roleOptions = [
  { label: 'Role 1', value: 'role1' },
  { label: 'Role 2', value: 'role2' },
  { label: 'Role 3', value: 'role3' },
]

const skillOptions = [
  { label: 'Skill 1', value: 'skill1' },
  { label: 'Skill 2', value: 'skill2' },
  { label: 'Skill 3', value: 'skill3' },
]

type Props = {
  skillCategory: CategoryWithSkills
  onAddSkill: (skills: { id: number; name: string }[]) => void
}

const { I18n } = window
const { Title, Paragraph } = Typography

export const SkillsGroupCard: FC<Props> = ({ skillCategory, onAddSkill }) => {
  const [skillType, setSkillType] = useState('role')
  const { isMobile } = useContext(MediaQueryContext)
  const [selectedSkills, setSelectedSkills] = useState<{ id: number; name: string }[]>([])
  const handleSkillTypeChange = (e) => {
    setSkillType(e.target.value)
  }

  return (
    <BoxWithShadow style={{ padding: '24px 24px' }}>
      <Space className={`${styles.heading} w-100`}>
        <Avatar
          size={64}
          // API changes not available yet
          // src={skillCategory.iconUrl}
        />
        <div>
          <Title className="mb-0" level={4}>{skillCategory.category}</Title>
          <Paragraph>
            {/* API changes not available yet */}
            {/* {skillCategory.description} */}
          </Paragraph>
        </div>
      </Space>
      <Title level={5}>{I18n.t('idp.initial_steps.select_skills')}</Title>
      <Space className="w-100" size="large" direction="vertical">
        <Space>
          {skillCategory.skills.map(skill => (
            <Button onClick={() => onAddSkill([skill])} size="small" type="primary" key={skill.id} ghost>
              {skill.name}
            </Button>
          ))}
        </Space>
        <MoreSkillsContainer>
          <Radio.Group onChange={handleSkillTypeChange} value={skillType}>
            <Radio value="role">{I18n.t('idp.initial_steps.role')}</Radio>
            {/* <Radio value="function">Function</Radio> */}
          </Radio.Group>
          {skillType === 'role' ? (
            <Row gutter={isMobile ? [0, 16] : [0, 0]} className="mt-4">
              <Col xs={{ span: 24 }} sm={{ span: 8 }}>
                <Select
                  className="w-100"
                  placeholder={I18n.t('idp.initial_steps.select_role_placeholder')}
                  options={roleOptions}
                />
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 16 }}>
                <Select
                  className="w-100"
                  placeholder={I18n.t('idp.initial_steps.select_skills_placeholder')}
                  options={skillOptions}
                  mode="multiple"
                  onChange={value => setSelectedSkills(value)}
                />
              </Col>
            </Row>

          ) : null}
          <Row justify="end">
            <ButtonWithArrow
              onClick={() => onAddSkill(selectedSkills)}
              disabled={selectedSkills.length === 0}
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
