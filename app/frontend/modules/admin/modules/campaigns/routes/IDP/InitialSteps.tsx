import {
  useEffect, useState,
} from 'react'
import {
  Steps, Layout, Flex,
  Spin,
} from 'antd'
import {
  useParams, useNavigate,
} from 'react-router-dom'
import { GettingStart } from './GettingStartStep'
import { SkillGapReportStep } from './SkillGapReportStep'
import { useResources } from '~/hooks/useResources'
import { UserIdpPlan } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'
import { AdminAddSkills } from './AdminAddSkills'
import { ResetPlanButton } from '~/components/IdpShared/ResetPlanButton'

import { InformationBanner } from './InformationBanner'
import { USER_IDP_PLAN_STATUS, STEPS } from './constants'

const { I18n } = window

export const InitialStepsComponent = () => {
  const [currentStep, setCurrentStep] = useState(STEPS.gettingStarted)
  const [isLoading, setIsLoading] = useState(true)

  const {
    idpPlanId, projectId, campaignId, userId,
  } = useParams()

  const { step: paramStep } = useParams()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const currentPath = `/admin/projects/${projectId}/new_campaigns/${campaignId}/participants/subjects/${userId}/idp/${idpPlanId}`

  const {
    fetchSingle: fetchUserIdpPlan, updateResource: updatePlan, getResource, memberAction,
  } = useResources<UserIdpPlan>(
    'user_idp_plans',
    {
      apiConfig: {
        include: ['idp_template', 'skills.development_actions', 'skills'],
        include_resource_meta: ['permissions'],
        query: {
          project_id: projectId,
          campaign_id: campaignId,
        },
      },
    },
  )

  const userIdpPlanData = getResource(idpPlanId as string) as UserIdpPlan

  const canResetPlan = userIdpPlanData?.meta?.permissions?.reset ?? false

  const STEP_ITEMS = [
    {
      title: I18n.t('idp.initial_steps.getting_started'),
      step: STEPS.gettingStarted,
    },
    {
      title: I18n.t('idp.initial_steps.skill_gap_report'),
      hide: !userIdpPlanData?.skillGapReportAvailable,
      step: STEPS.skillGapReport,
    },
    {
      title: I18n.t('idp.initial_steps.add_skills_step'),
      step: STEPS.addSkills,
    },
  ]

  const visibleSteps = STEP_ITEMS.filter(item => !item.hide)
  const currentStepIndex = visibleSteps.findIndex(({ step }) => step === currentStep)

  useEffect(() => {
    if (!userIdpPlanData) { return }

    if (userIdpPlanData?.status !== USER_IDP_PLAN_STATUS.NOT_STARTED) {
      navigate(`${currentPath}/plan`)
    }

    if (paramStep === STEPS.skillGapReport && userIdpPlanData && !userIdpPlanData?.skillGapReportAvailable) {
      setCurrentStep(STEPS.gettingStarted)
      navigate(`${currentPath}/step/getting_started`)
    }
  }, [userIdpPlanData])

  useEffect(() => {
    switch (currentPath.split('step/')[1]) {
      case 'getting_started': setCurrentStep(STEPS.gettingStarted); break
      case 'add_skills': setCurrentStep(STEPS.addSkills); break
      case 'skill_gap_report': setCurrentStep(STEPS.skillGapReport); break
      default: setCurrentStep(STEPS.gettingStarted); break
    }
  }, [currentPath])


  useEffect(() => {
    fetchUserIdpPlan({
      id: idpPlanId as string,
    }).then(() => {
      setIsLoading(false)
    })
  }, [idpPlanId])

  const handleNextForGettingStartedStep = () => {
    if (!userIdpPlanData?.skillGapReportAvailable) {
      setCurrentStep(STEPS.addSkills)
      navigate(`${currentPath}/step/add_skills`)
    } else {
      setCurrentStep(STEPS.skillGapReport)
      navigate(`${currentPath}/step/skill_gap_report`)
    }
  }

  const handleNextForSkillGapReportStep = () => {
    setCurrentStep(STEPS.addSkills)
    navigate(`${currentPath}/step/add_skills`)
  }

  const handlePrevForSkillGapReportStep = () => {
    navigate(`${currentPath}/step/getting_started`)
  }

  const handlePrevForAddSkillsStep = () => {
    if (userIdpPlanData?.skillGapReportAvailable) {
      navigate(`${currentPath}/step/skill_gap_report`)
    } else {
      navigate(`${currentPath}/step/getting_started`)
    }
  }

  const handleNextForAddSkillsStep = (selectedSkills) => {
    setIsLoading(true)

    const planPayload = userIdpPlanData
    const skillPayload = {
      skills: selectedSkills.map(skill => ({
        id: skill.id,
        category: skill.category,
        name: skill.name,
        skill_id: skill.id,
      })),
    }

    updatePlan({
      id: planPayload.id,
      userId: planPayload.userId.toString(),
      idpTemplateId: planPayload.idpTemplateId.toString(),
      campaignId: planPayload.campaignId.toString(),
      active: planPayload.active,
      creatorId: planPayload.creatorId.toString(),
      approvalStatus: USER_IDP_PLAN_STATUS.DRAFT,
      ...skillPayload,
    }).then(() => {
      setIsLoading(false)
      navigate(`${currentPath}/plan`)
    })
  }

  const extraHeaderContent = (
    <>
      {canResetPlan && (
        <ResetPlanButton
          action={() => {
            setIsLoading(true)
            memberAction({
              id: userIdpPlanData?.id,
              action: 'reset',
              method: 'post',
            }).then(() => {
              setIsLoading(false)
              navigate(`${currentPath}/step/getting_started`)
            })
          }}
        />
      )}
    </>
  )

  const idpSteps = (
    <Flex vertical className="p-4" style={{ fontSize: '16px' }}>
      <Steps
        className="mb-4"
        current={currentStepIndex === -1 ? 0 : currentStepIndex}
        items={visibleSteps.map(({ title }) => ({ title }))}
      />
      {paramStep === STEPS.gettingStarted
      && (
        <GettingStart
          introMessage={userIdpPlanData?.instructions.content}
          next={handleNextForGettingStartedStep}
        />
      )}
      {paramStep === STEPS.skillGapReport && (
        <SkillGapReportStep
          skillGapReportId={userIdpPlanData?.skillGapReportId}
          next={handleNextForSkillGapReportStep}
          prev={handlePrevForSkillGapReportStep}
          nextLabel={I18n.t('idp.initial_steps.add_skills_step')}
        />
      )}
      {paramStep === STEPS.addSkills && (
        <AdminAddSkills
          header={extraHeaderContent}
          userIdpSkills={userIdpPlanData?.skills}
          next={handleNextForAddSkillsStep}
          prev={handlePrevForAddSkillsStep}
        />
      )}
    </Flex>
  )


  return (
    <>
      <InformationBanner />
      <Layout.Content>
        <Flex justify="center" align="middle" vertical style={{ padding: '1rem' }}>
          {isLoading && (
            <Spin size="large" />
          )}
          {!isLoading && (userIdpPlanData?.status === USER_IDP_PLAN_STATUS.NOT_STARTED ? idpSteps : <></>)}
        </Flex>
      </Layout.Content>
    </>

  )
}
