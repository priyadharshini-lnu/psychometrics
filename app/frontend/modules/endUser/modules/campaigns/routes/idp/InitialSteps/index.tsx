import { useEffect, useState } from 'react'
import { Steps, Layout } from 'antd'
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
  getting_start = 0,
  skill_gap_report = 1,
  add_skills = 2,
  rate_skills = 3,
}

const connector = connect((state: RootState) => ({
  status: state.campaigns.idp.status,
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
}) => {
  const { step: paramStep } = useParams() as {step: string}
  const navigate = useNavigate()
  const [step, setStep] = useState<number>(STEPS[paramStep] || STEPS.getting_start)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const next = (step) => {
    setStep(step)
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

  useEffect(() => {
    fetchUserIdpPlan(currentUser.id)
  }, [])

  useEffect(() => {
    if (status && status !== USER_IDP_PLAN_STATUS.NOT_STARTED) {
      navigate('/idp/my_plan')
    }
  }, [status])

  useEffect(() => {
    setStep(STEPS[paramStep] || STEPS.getting_start)
  }, [paramStep])

  return (
    <IdpPageLayoutWrapper>
      <Layout.Content className={styles.pageContent}>
        <BoxWithShadow className={styles.steps}>
          <Steps
            current={step}
            items={[
              {
                title: I18n.t('idp.initial_steps.getting_start'),
              },
              {
                title: I18n.t('idp.initial_steps.skill_gap_report'),
              },
              {
                title: I18n.t('idp.initial_steps.add_skills_step'),
              },
              {
                title: I18n.t('idp.initial_steps.rate_skills'),
              },
            ]}
          />
        </BoxWithShadow>
        {step === STEPS.getting_start && <GettingStart next={() => next(STEPS.skill_gap_report)} />}
        {step === STEPS.skill_gap_report && <SkillGapReport next={() => next(STEPS.add_skills)} />}
        {step === STEPS.add_skills && <AddSkills next={() => next(STEPS.rate_skills)} />}
        {step === STEPS.rate_skills && <RateSkills next={handleSubmit} isSubmitting={isSubmitting} />}
      </Layout.Content>
    </IdpPageLayoutWrapper>

  )
}

export const InitialSteps = connector(InitialStepsComponent)
