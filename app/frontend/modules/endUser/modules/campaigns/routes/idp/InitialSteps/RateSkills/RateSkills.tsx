import { useState, useContext } from 'react'
import {
  Typography, Table, Rate, Space, Avatar, Divider, TableColumnsType,
} from 'antd'
import { ButtonWithArrow, BoxWithShadow, MediaQueryContext } from '~/glint'

const { Title, Paragraph } = Typography
const { I18n } = window

const selectedSkills = [
  { id: 1, name: 'Skill 1', rating: 3 },
  { id: 2, name: 'Skill 2', rating: 0 },
  { id: 3, name: 'Skill 3', rating: 5 },
  { id: 4, name: 'Skill 4', rating: 2 },
  { id: 5, name: 'Skill 5', rating: 1 },
  { id: 6, name: 'Skill 6', rating: 3 },
  { id: 7, name: 'Skill 7', rating: 4 },
  { id: 8, name: 'Skill 8', rating: 5 },
  { id: 9, name: 'Skill 9', rating: 2 },
  { id: 10, name: 'Skill 10', rating: 1 },
]

type SkillType = {
id: number
name: string
rating: number
}


export const RateSkills = ({ next }) => {
  const [skillsToBeRated, setSkillsToBeRated] = useState(selectedSkills)
  const { isMobile } = useContext(MediaQueryContext)

  const handleRatingChange = (updatedSkill) => {
    setSkillsToBeRated(skillsToBeRated.map(skill => (skill.id === updatedSkill.id ? updatedSkill : skill)))
  }
  const columns: TableColumnsType<SkillType> = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: I18n.t('idp.initial_steps.skill_column_header'),
      dataIndex: 'name',
      key: 'name',
      width: isMobile ? 'initial' : '50%',
    },
    {
      title: I18n.t('idp.initial_steps.rating_column_header'),
      dataIndex: 'rating',
      key: 'rating',
      render: (rating, skill) => (
        <Rate onChange={(val) => { handleRatingChange({ ...skill, rating: val }) }} value={rating} />
      ),
    },
  ]
  return (
    <>
      <BoxWithShadow className="mt-6 p-6">
        <Space>
          <Avatar size={64} />
          <div>
            <Title className="mb-0" level={4}>{I18n.t('idp.initial_steps.rate_skills_title')}</Title>
            <Paragraph>
              {I18n.t('idp.initial_steps.rate_skills_description')}
            </Paragraph>
          </div>
        </Space>
        <Divider />
        <Table
          dataSource={skillsToBeRated}
          columns={columns}
          pagination={false}
        />
      </BoxWithShadow>
      <div className="flex justify-end mt-6">
        <ButtonWithArrow label="Next" size="small" type="primary" onClick={() => next()} />
      </div>
    </>
  )
}
