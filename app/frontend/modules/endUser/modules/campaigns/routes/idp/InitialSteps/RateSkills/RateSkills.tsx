import { useState, useContext, useEffect } from 'react'
import {
  Typography, Table, Rate, Space, Avatar, Divider, TableColumnsType,
} from 'antd'
import { connect } from 'react-redux'
import { ButtonWithArrow, BoxWithShadow, MediaQueryContext } from '~/glint'
import {
  updateUserIdpSkill,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'

import { RootState } from '~/modules/endUser/core/rootReducers'
import { RateSkillIcon } from '~/glint/icons'

const { Title, Paragraph } = Typography
const { I18n } = window

type SkillType = {
  id: number
  name: string
  initialRating: number
}

const connector = connect((state: RootState) => ({
  selectedSkills: state.campaigns.idp.userIdpSkills,
}),
{
  updateUserIdpSkill,
})


export const RateSkillsComponent = ({
  next,
  selectedSkills,
  updateUserIdpSkill,
  isSubmittingPlan = false,
}) => {
  const [skillsToBeRated, setSkillsToBeRated] = useState<SkillType[]>(Object.values(selectedSkills))
  const { isMobile } = useContext(MediaQueryContext)

  const handleRatingChange = (updatedSkill) => {
    setSkillsToBeRated(skillsToBeRated.map(skill => (skill.id === updatedSkill.id ? updatedSkill : skill)))
    updateUserIdpSkill(updatedSkill.id, { initialRating: updatedSkill.initialRating })
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
      dataIndex: 'initialRating',
      key: 'initialRating',
      render: (rating, skill) => (
        <Rate onChange={(val) => { handleRatingChange({ ...skill, initialRating: val }) }} value={rating} />
      ),
    },
  ]

  useEffect(() => {
    setSkillsToBeRated(Object.values(selectedSkills))
  }, [selectedSkills])
  return (
    <>
      <BoxWithShadow className="mt-6 p-6">
        <Space>
          <Avatar size={64} src={<RateSkillIcon height="100%" width="100%" style={{ justifyContent: 'center' }} />} />
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
      <div className="flex justify-center mt-6">
        <ButtonWithArrow
          loading={isSubmittingPlan}
          label={I18n.t('idp.initial_steps.next')}
          size="small"
          type="primary"
          onClick={next}
        />
      </div>
    </>
  )
}

export const RateSkills = connector(RateSkillsComponent)
