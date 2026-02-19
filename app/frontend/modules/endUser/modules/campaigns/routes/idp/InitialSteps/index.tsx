import { useEffect, useState, useContext } from 'react'
import {
  Steps, Layout, Spin, Flex,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import cs from 'classnames'
import { USER_IDP_PLAN_STATUS } from '~/components/IdpShared/constants'
import { GettingStart } from './GettingStart'
import { SkillGapReportStep } from './SkillGapReport'
import { AddSkills } from './AddSkills'
import { RateSkills } from './RateSkills'
import { ReflectiveQuestionsStep } from './ReflectiveQuestions'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import {
  fetchUserIdpPlan,
  updateUserIdpPlan,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { RootState } from '~/modules/endUser/core/rootReducers'
import styles from './Steps.less'
import { useAppSelector } from '~/modules/endUser/store/hooks'
import { getReflectiveQuestions } from '~/modules/endUser/modules/campaigns/core/idp/idpPlanRtk'
import { MediaQueryContext } from '~/glint'

const { I18n } = window

enum STEPS {
  gettingStarted = 'getting_started',
  skillGapReport = 'skill_gap_report',
  addSkills = 'add_skills',
  rateSkills = 'rate_skills',
  reflectionQuestions = 'reflection_questions',
}

const connector = connect((state: RootState) => ({
  status: state.campaigns.idp.status,
  skillGapReportAvailable: state.campaigns.idp.skillGapReportAvailable,
  selfRatingEnabled: state.campaigns.idp.selfRatingEnabled,
  currentUser: state.currentUser,
  introMessage: state.campaigns.idp.introMessage,
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
  introMessage,
}) => {
  const { step: paramStep } = useParams() as {step: string}
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { isMobile, isTablet, isDesktop } = useContext(MediaQueryContext)


  const reflectionQuestions = useAppSelector(getReflectiveQuestions)

  const STEP_ITEMS = [
    {
      title: I18n.t('idp.initial_steps.getting_started'),
      step: STEPS.gettingStarted,
      ariaHidden: true,
      ariaLabel: 'Getting Started Step',
    },
    {
      title: I18n.t('idp.initial_steps.skill_gap_report'),
      hide: !skillGapReportAvailable,
      step: STEPS.skillGapReport,
      ariaHidden: true,
      ariaLabel: 'Skill Gap Report Step',
    },
    {
      title: I18n.t('idp.initial_steps.add_skills_step'),
      step: STEPS.addSkills,
      ariaHidden: true,
      ariaLabel: 'Add Skills Step',
    },
    {
      title: I18n.t('idp.initial_steps.rate_skills'),
      hide: !selfRatingEnabled,
      step: STEPS.rateSkills,
      ariaHidden: true,
      ariaLabel: 'Rate Skills Step',
    },
    {
      title: I18n.t('idp.initial_steps.reflective_questions'),
      hide: reflectionQuestions.length === 0,
      step: STEPS.reflectionQuestions,
      ariaHidden: true,
      ariaLabel: 'Reflective Questions Step',
    },
  ]

  const visibleSteps = STEP_ITEMS.filter(item => !item.hide)
  const currentStep = visibleSteps.findIndex(({ step }) => step === paramStep)

  const next = (step) => {
    navigate(`/idp/steps/${step}`)
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
      next(STEPS.skillGapReport)
    } else {
      next(STEPS.addSkills)
    }
  }

  const handleNextForRateSkillsStep = () => {
    if (reflectionQuestions.length === 0) {
      handleSubmit()
    }
    next(STEPS.reflectionQuestions)
  }

  const handleNextForAddSkillsStep = () => {
    if (selfRatingEnabled) {
      next(STEPS.rateSkills)
    } else {
      handleSubmit()
    }
  }

  const handlePrevForAddSkillsStep = () => {
    if (skillGapReportAvailable) {
      navigate(`/idp/steps/${STEPS.skillGapReport}`)
    } else {
      navigate(`/idp/steps/${STEPS.gettingStarted}`)
    }
  }

  const handlePrevForSkillGapReportStep = () => {
    navigate(`/idp/steps/${STEPS.gettingStarted}`)
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
          <Layout.Content className={cs(styles.pageContent, isMobile && styles['padding-0'])}>
            <div
              role="region"
              aria-label={currentStep !== -1 ? `${I18n.t('idp.current_step',
                { step: visibleSteps[currentStep].title })}`
                : undefined}
              className="pt-4 mb-4"
            >
              <Steps
                orientation="horizontal"
                responsive={false}
                current={currentStep === -1 ? 0 : currentStep}
                items={isMobile || isTablet || isDesktop ? visibleSteps.map(() => ({ title: '' }))
                  : visibleSteps.map(({ title }) => ({ title }))
                  }
                aria-hidden="true"
              />
            </div>
            {paramStep === STEPS.gettingStarted && (
              <GettingStart
                introMessage={introMessage}
                next={handleNextForGettingStartedStep}
              />
            )}
            {paramStep === STEPS.skillGapReport && (
              <SkillGapReportStep
                next={() => next(STEPS.addSkills)}
                prev={handlePrevForSkillGapReportStep}
                nextLabel={I18n.t('idp.initial_steps.add_skills_step')}
              />
            )}
            {paramStep === STEPS.addSkills && (
              <AddSkills
                selfRatingEnabled={selfRatingEnabled}
                next={handleNextForAddSkillsStep}
                isSubmittingPlan={isSubmitting}
                prev={handlePrevForAddSkillsStep}
              />
            )}
            {paramStep === STEPS.rateSkills && (
              <RateSkills
                next={handleNextForRateSkillsStep}
                isSubmittingPlan={isSubmitting}
                prev={() => {
                  navigate(`/idp/steps/${STEPS.addSkills}`)
                }}
              />
            )}
            {paramStep === STEPS.reflectionQuestions && (
              <ReflectiveQuestionsStep
                next={handleSubmit}
                prev={() => {
                  navigate(`/idp/steps/${STEPS.rateSkills}`)
                }}
              />
            )}
          </Layout.Content>
        )
    }
    </IdpPageLayoutWrapper>

  )
}

export const InitialSteps = connector(InitialStepsComponent)
