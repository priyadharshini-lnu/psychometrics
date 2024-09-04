import { useEffect, useState } from 'react'
import { Steps, Layout } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { GettingStart } from './GettingStart'
import { SkillGapReport } from './SkillGapReport'
import { AddSkills } from './AddSkills'
import { RateSkills } from './RateSkills'
import { BoxWithShadow } from '~/glint'
import { IdpPageLayoutWrapper } from '../components/IdpPageLayoutWrapper/IdpPageLayoutWrapper'

import styles from './Steps.less'

const { I18n } = window

enum STEPS {
  getting_start = 0,
  skill_gap_report = 1,
  add_skills = 2,
  rate_skills = 3,
}

export const InitialSteps = () => {
  const { step: paramStep } = useParams() as {step: string}
  const navigate = useNavigate()
  const [step, setStep] = useState<number>(STEPS[paramStep] || STEPS.getting_start)

  const next = (step) => {
    setStep(step)
    navigate(`/idp/steps/${STEPS[step]}`)
  }

  const submit = () => {
    navigate('/idp/my_plan')
  }

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
        {step === STEPS.rate_skills && <RateSkills next={() => submit()} />}
      </Layout.Content>
    </IdpPageLayoutWrapper>

  )
}
