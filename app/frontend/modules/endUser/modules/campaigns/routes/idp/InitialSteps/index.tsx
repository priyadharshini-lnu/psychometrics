import { useEffect, useState } from 'react'
import {
  Steps, Layout, Spin, Flex,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { GettingStart } from './GettingStart'
import { SkillGapReport } from './SkillGapReport'
import { AddSkills } from './AddSkills'
import { RateSkills } from './RateSkills'
import { BoxWithShadow } from '~/glint'
import { IdpPageLayoutWrapper } from '../components/IdpPageLayoutWrapper/IdpPageLayoutWrapper'
import { USER_IDP_PLAN_STATUS } from '../constants'


import {
  fetchUserIdpPlan,
  updateUserIdpPlan,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'

import { RootState } from '~/modules/endUser/core/rootReducers'


import styles from './Steps.less'

const { I18n } = window

enum STEPS {
  getting_start = 'getting_start',
  skill_gap_report = 'skill_gap_report',
  add_skills = 'add_skills',
  rate_skills = 'rate_skills',
}


const connector = connect((state: RootState) => ({
  status: state.campaigns.idp.status,
  skillGapReportAvailable: state.campaigns.idp.skillGapReportAvailable,
  selfRatingEnabled: state.campaigns.idp.selfRatingEnabled,
  currentUser: state.currentUser,
}),
{
  fetchUserIdpPlan,
  updateUserIdpPlan,
})

const InitialStepsComponent = ({
  status,
  fetchUserIdpPlan,
  currentUser,
  updateUserIdpPlan,
  skillGapReportAvailable,
  selfRatingEnabled,
}) => {
  const { step: paramStep } = useParams() as {step: string}
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const STEP_ITEMS = [
    {
      title: I18n.t('idp.initial_steps.getting_start'),
      step: STEPS.getting_start,
    },
    {
      title: I18n.t('idp.initial_steps.skill_gap_report'),
      hide: !skillGapReportAvailable,
      step: STEPS.skill_gap_report,
    },
    {
      title: I18n.t('idp.initial_steps.add_skills_step'),
      step: STEPS.add_skills,
    },
    {
      title: I18n.t('idp.initial_steps.rate_skills'),
      hide: !selfRatingEnabled,
      step: STEPS.rate_skills,
    },
  ]

  const visibleSteps = STEP_ITEMS.filter(item => !item.hide)
  const currentStep = visibleSteps.findIndex(({ step }) => step === paramStep)

  const next = (step) => {
    navigate(`/idp/steps/${STEPS[step]}`)
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    updateUserIdpPlan(currentUser.id, USER_IDP_PLAN_STATUS.DRAFT).then(() => {
      navigate('/idp/my_plan')
    }).finally(() => {
      setIsSubmitting(false)
    })
  }

  const handleNextForGettingStartedStep = () => {
    if (skillGapReportAvailable) {
      next(STEPS.skill_gap_report)
    } else {
      next(STEPS.add_skills)
    }
  }

  const handleNextForAddSkillsStep = () => {
    if (selfRatingEnabled) {
      next(STEPS.rate_skills)
    } else {
      handleSubmit()
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchUserIdpPlan(currentUser.id).finally(() => {
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (status && status !== USER_IDP_PLAN_STATUS.NOT_STARTED) {
      navigate('/idp/my_plan')
    }
  }, [status])

  return (
    <IdpPageLayoutWrapper>
      {isLoading ? <Flex className="h-full" align="center"><Spin size="large" /></Flex>
        : (
          <Layout.Content className={styles.pageContent}>
            <BoxWithShadow className={styles.steps}>
              <Steps
                current={currentStep === -1 ? 0 : currentStep}
                items={visibleSteps.map(({ title }) => ({ title }))}
              />
            </BoxWithShadow>
            {paramStep === STEPS.getting_start && <GettingStart next={handleNextForGettingStartedStep} />}
            {paramStep === STEPS.skill_gap_report && (
              <SkillGapReport
                next={() => next(STEPS.add_skills)}
              />
            )}
            {paramStep === STEPS.add_skills && (
              <AddSkills
                selfRatingEnabled={selfRatingEnabled}
                next={handleNextForAddSkillsStep}
                isSubmittingPlan={isSubmitting}
              />
            )}
            {paramStep === STEPS.rate_skills && (
              <RateSkills
                next={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </Layout.Content>
        )
    }
    </IdpPageLayoutWrapper>

  )
}

export const InitialSteps = connector(InitialStepsComponent)
