import { useState, useContext, useEffect } from 'react'
import {
  Typography, Table, Space, Avatar, TableColumnsType, Flex,
} from 'antd'
import { connect } from 'react-redux'
import cs from 'classnames'
import { Separator } from '~/components/IdpShared/Separator'
import { renderSkillTypeIcon } from '~/components/IdpShared/utils'
import {
  ButtonWithArrow, MediaQueryContext, BackButton, AccessibleRating,
} from '~/glint'
import {
  updateUserIdpSkill,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { RateSkillIcon } from '~/glint/icons'
import styles from './styles.less'

const { Title, Paragraph } = Typography
const { I18n } = window

type SkillType = {
  id: number
  name: string
  initialRating: number
  skillType: string
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
  prev,
}) => {
  const [skillsToBeRated, setSkillsToBeRated] = useState<SkillType[]>(Object.values(selectedSkills))
  const { isMobile } = useContext(MediaQueryContext)

  const handleRatingChange = (updatedSkill) => {
    setSkillsToBeRated(skillsToBeRated.map(skill => (skill.id === updatedSkill.id ? updatedSkill : skill)))
    updateUserIdpSkill(updatedSkill.id, { initialRating: updatedSkill.initialRating })
  }
  const columns: TableColumnsType<SkillType> = [
    {
      title: I18n.t('idp.initial_steps.skill_column_header'),
      dataIndex: 'name',
      key: 'name',
      width: isMobile ? 'initial' : '50%',
      onHeaderCell: () => (
        {
          scope: 'col',
        }
      ),
      render: (name, skill) => (
        <Flex gap={8} vertical>
          <Typography.Text
            style={{ fontWeight: 500 }}
          >
            {name}
          </Typography.Text>
          {isMobile && (
            <Flex align="center">
              <Avatar
                size={32}
                src={renderSkillTypeIcon(skill.skillType)}
                style={{ marginRight: '4px' }}
                aria-hidden="true"
              />
              <Typography.Text
                className="fs-14"
              >
                {`${I18n.t(`idp.${skill.skillType}`)}`}
              </Typography.Text>
            </Flex>
          )}
        </Flex>
      ),
    },
    ...(!isMobile ? [{
      title: 'Skill Type',
      dataIndex: 'skillType',
      key: 'skillType',
      onHeaderCell: () => (
        {
          scope: 'col',
        }
      ),
      render: (_, skill) => (
        <Flex align="center">
          <Avatar
            size={32}
            src={renderSkillTypeIcon(skill.skillType)}
            style={{ marginRight: '4px' }}
            aria-hidden="true"
          />
          <Typography.Text
            className="fs-14"
          >
            {`${I18n.t(`idp.${skill.skillType}`)}`}
          </Typography.Text>
        </Flex>
      ),
    }] : []),
    {
      title: <Flex justify="end">{I18n.t('idp.initial_steps.rating_column_header')}</Flex>,
      dataIndex: 'initialRating',
      key: 'initialRating',
      onHeaderCell: () => (
        {
          scope: 'col',
        }
      ),
      render: (rating, skill) => (
        <Flex justify="end">
          <AccessibleRating
            onChange={(val) => { handleRatingChange({ ...skill, initialRating: val }) }}
            value={rating}
          />
        </Flex>
      ),
    },
  ]

  useEffect(() => {
    setSkillsToBeRated(Object.values(selectedSkills))
  }, [selectedSkills])
  return (
    <>
      <Flex vertical={isMobile} className="mb-4" flex={1} justify="space-between">
        <Space>
          <BackButton
            onPrev={prev}
          />
          <Title level={3} className="mb-0 mt-0">{I18n.t('idp.initial_steps.rate_skills_title')}</Title>
        </Space>
        <Flex justify="end" align="center">
          <ButtonWithArrow
            loading={isSubmittingPlan}
            label={I18n.t('idp.initial_steps.next')}
            type="primary"
            onClick={next}
          />
        </Flex>
      </Flex>
      <Separator
        className="mb-4 mt-0"
      />
      <Space className="mb-4">
        <div
          className={cs('flex justify-center items-center p-4', styles['rate-skills-icon'])}
        >
          <RateSkillIcon height={32} width={32} />
        </div>
        <Paragraph>
          {I18n.t('idp.initial_steps.rate_skills_description')}
        </Paragraph>
      </Space>
      <Table
        className={styles.rateSkillsTable}
        dataSource={skillsToBeRated}
        columns={columns}
        pagination={false}
      />
    </>
  )
}

export const RateSkills = connector(RateSkillsComponent)
