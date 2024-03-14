import { useState } from 'react'
import { Steps } from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import { GettingStart } from './GettingStart'
import { SkillGapReport } from './SkillGapReport'
import { AddSkills } from './AddSkills'
import { RateSkills } from './RateSkills'
import { BoxWithShadow } from '~/glint'
import styles from './Steps.less'

const { I18n } = window

enum STEPS {
  getting_start = 0,
  skill_gap_report = 1,
  add_skills = 2,
  rate_skills = 3,
}

export const InitialSteps = () => {
  const { step: paramStep } = useParams<{step: string}>()
  const history = useHistory()
  const [step, setStep] = useState<STEPS>(STEPS[paramStep] || STEPS.getting_start) // TODO: add url switching on change

  const next = (step) => {
    setStep(step)
    history.push(`/idp/steps/${STEPS[step]}`)
  }

  const submit = () => {
    history.push('/idp/my_plan')
  }

  return (
    <div className={styles.main}>
      <BoxWithShadow className={styles.steps}>
        <Steps
          current={+STEPS[step]}
          items={[
            {
              title: I18n.t('idp.initial_steps.getting_start'),
            },
            {
              title: I18n.t('idp.initial_steps.skill_gap_report'),
            },
            {
              title: I18n.t('idp.initial_steps.add_skills'),
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
    </div>
  )
}
