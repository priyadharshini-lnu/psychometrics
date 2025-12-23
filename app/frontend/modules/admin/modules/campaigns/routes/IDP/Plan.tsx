import { useState, useEffect, useMemo } from 'react'
import {
  Typography, Button, Tabs, Flex, Spin, message,
} from 'antd'
import {
  debounce,
} from 'lodash'
import {
  useParams, useNavigate,
} from 'react-router-dom'
import cs from 'classnames'
import { DevelopmentActionListView } from './DevelopmentActionsFlow/DevelopmentActionListView'
import { AddSkillsStep } from '~/components/IdpShared/AddSkillsStep'
import { groupSkillsBySkillType }
  from '~/modules/endUser/modules/campaigns/routes/idp/MyPlan/utils'
import { useResources } from '~/hooks/useResources'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import {
  UserIdpPlan, UserIdpDevelopmentActions, IdpSkills, UserIdpSkills,
} from '~/modules/admin/modules/campaigns/core/UserIdpPlan'
import { InformationBanner } from './InformationBanner'
import { ResetPlanButton } from '~/components/IdpShared/ResetPlanButton'
import { USER_IDP_PLAN_STATUS } from './constants'
import { useSearchSkills } from './AdminAddSkills/useSearchSkills'
import { SkillGapReportTab } from './SkillGapReportTab'
import { SKILL_TYPE } from '~/components/IdpShared/constants'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './Plan.less'

const { I18n } = window

type UserIdpDevelopmentActionPayloadType = UserIdpDevelopmentActions & {_destroy?: boolean }

interface UserIdpMeta extends BaseMeta {
  features?: { aiAssistants: boolean }
}

export const Plan = () => {
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [idpDevelopmentActions, setIDPDevelopmentActions] = useState<UserIdpDevelopmentActions[]>([])
  const [idpDevelopmentActionsPayload,
    setIDPDevelopmentActionsPayload] = useState<UserIdpDevelopmentActionPayloadType[]>([])
  const [availableIDPDevelopmentActions, setAvailableIDPDevelopmentActions] = useState<UserIdpDevelopmentActions[]>([])
  const [selectedSkills, setSelectedSkills] = useState<UserIdpSkills[]>([])
  const {
    idpPlanId, projectId, campaignId, userId,
  } = useParams()
  const { tab: paramTab } = useParams()
  const [tab, setTab] = useState(paramTab || 'list')

  // eslint-disable-next-line max-len
  const currentPath = `/admin/projects/${projectId}/new_campaigns/${campaignId}/participants/subjects/${userId}/idp/${idpPlanId}`

  const navigate = useNavigate()

  const {
    data: userIdpPlanData, fetchSingle: fetchUserIdpPlan, updateResource: updatePlan, meta, memberAction,
  } = useResources<UserIdpPlan, UserIdpMeta>(
    'user_idp_plans',
    {
      apiConfig: {
        include: ['idp_template', 'user_idp_development_actions', 'user_idp_skills'],
        include_resource_meta: ['permissions'],
      },
    },
  )

  const canResetPlan = userIdpPlanData[0]?.meta?.permissions?.reset ?? false

  const {
    data: allSkills, fetch: fetchIdpSkillDetails, fetchSingle: fetchSingleSkill, setData: setSkills,
  } = useResources<IdpSkills>(
    'skills', {
      apiConfig: {
        filter: {
          available_skills_by_plan_id: idpPlanId as string,
        },
        include: ['development_actions'],
      },
    },
  )
  const searchSkillResource = useSearchSkills(idpPlanId)

  const {
    collectionAction,
  } = useResources<UserIdpDevelopmentActions>(
    'user_idp_development_actions',
  )

  useEffect(() => {
    fetchUserIdpPlan({
      id: idpPlanId as string,
    }).then((res: UserIdpPlan) => {
      setSelectedSkills(res.userIdpSkills)
      setIsLoading(false)
    })
  }, [idpPlanId])

  useEffect(() => {
    if (userIdpPlanData.length) {
      setIDPDevelopmentActions(userIdpPlanData[0]
        ?.userIdpDevelopmentActions)
    }
    setIDPDevelopmentActionsPayload(userIdpPlanData[0]
      ?.userIdpDevelopmentActions as UserIdpDevelopmentActionPayloadType[])
  }, [userIdpPlanData])

  const userIdpSkills = useMemo(() => selectedSkills.reduce((acc, skill) => {
    acc[skill.id] = skill
    return acc
  }, {}) ?? [], [selectedSkills])

  const normalizedUserIdpDevelopmentActions = useMemo(() => idpDevelopmentActions.reduce((acc, da) => {
    acc[da.id] = da
    return acc
  }, {}) ?? [], [idpDevelopmentActions])


  const listData = useMemo(() => groupSkillsBySkillType(userIdpSkills,
    normalizedUserIdpDevelopmentActions),
  [userIdpSkills, normalizedUserIdpDevelopmentActions])

  const changeTab = (tab: string) => {
    setTab(tab)
  }

  const handleShowAvailableDevelopmentAction = (skillId) => {
    fetchSingleSkill({ id: skillId }).then((data: IdpSkills) => {
      setAvailableIDPDevelopmentActions(data.developmentActions)
    })
  }
  const handleAddDevelopmentAction = (developmentAction) => {
    setIDPDevelopmentActions([...idpDevelopmentActions,
      ...(Object.values(developmentAction) as UserIdpDevelopmentActions[])])
    setIDPDevelopmentActionsPayload([
      ...idpDevelopmentActions,
      ...(Object.values(developmentAction) as UserIdpDevelopmentActionPayloadType[]),
    ])
  }

  const handleRemoveDevelopmentAction = (developmentAction) => {
    const updatedDaPayload = idpDevelopmentActionsPayload.map((idpDevelopmentAction) => {
      if (idpDevelopmentAction.id === developmentAction.id) {
        // eslint-disable-next-line no-underscore-dangle
        idpDevelopmentAction._destroy = true
      }
      return idpDevelopmentAction
    })

    setIDPDevelopmentActionsPayload(updatedDaPayload as UserIdpDevelopmentActionPayloadType[])
    setIDPDevelopmentActions(idpDevelopmentActions.filter(idpDevelopmentAction => idpDevelopmentAction.id
       !== developmentAction.id))
  }

  const updateDevelopmentAction = (developmentAction) => {
    setIDPDevelopmentActions(idpDevelopmentActions.map(idpDevelopmentAction => (idpDevelopmentAction.id
      === developmentAction.id ? { ...developmentAction } : idpDevelopmentAction)))
    setIDPDevelopmentActionsPayload(idpDevelopmentActions.map(idpDevelopmentAction => (idpDevelopmentAction.id
        === developmentAction.id ? { ...developmentAction } : idpDevelopmentAction)))
  }

  const handleSave = () => {
    setIsLoading(true)
    setEditMode(false)
    const idpDaCollection = idpDevelopmentActionsPayload.reduce((acc, da) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const daPayload:any = {}
      daPayload.userIdpPlanId = Number(idpPlanId)
      daPayload.userIdpSkillId = Number(da.userIdpSkillId)
      daPayload.developmentActionId = da.developmentActionId ? Number(da.developmentActionId) : null
      daPayload.startDateTime = da.startDateTime ?? undefined
      daPayload.endDateTime = da.endDateTime ?? undefined
      daPayload.description = da.description ?? ''
      daPayload.name = da.name ?? ''
      daPayload.learningStyle = da.learningStyle
      daPayload.sourceType = da.sourceType || 0
      daPayload.id = Number(da.userIdpDevelopmentActionId) ?? undefined
      daPayload.progress = da.progress || 0
      // eslint-disable-next-line no-underscore-dangle
      daPayload._destroy = da._destroy ?? false
      return acc.concat(daPayload)
    }, [])

    collectionAction({
      method: 'post',
      action: '/bulk_update',
      body: {
        user_idp_development_actions: idpDaCollection,
      },
    }).then(() => {
      message.success(I18n.t('idp.changes_saved_to_plan'))
    }).catch((error) => {
      message.error(error)
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const handleAddMoreSkill = () => {
    setIsLoading(true)
    fetchIdpSkillDetails({
      apiConfig: {
        filter: {
          available_skills_by_plan_id: idpPlanId as string,
        },
        include: ['development_actions'],
      },
    }).then((response) => {
      setSkills(response.data)
      setShowAddSkill(true)
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const handleFinishAddSkill = () => {
    setShowAddSkill(false)
    handleNextForAddSkillsStep()
  }

  const debouncedSaveSkills = useMemo(() => debounce((userIdpSkills) => {
    setIsLoading(true)

    const planPayload = userIdpPlanData[0]

    const skillPayload = {

      skills: userIdpSkills.map(skill => ({
        id: skill.skillId,
        name: skill.name,
      })),
    }

    updatePlan({
      id: planPayload?.id,
      userId: planPayload?.userId.toString(),
      idpTemplateId: planPayload?.idpTemplateId.toString(),
      campaignId: planPayload?.campaignId.toString(),
      active: planPayload?.active,
      creatorId: planPayload?.creatorId.toString(),
      approvalStatus: planPayload?.status,
      ...skillPayload,
    }).then(() => {
      fetchIdpSkillDetails({
        apiConfig: {
          filter: {
            available_skills_by_plan_id: idpPlanId as string,
          },
          include: ['development_actions'],
        },
      }).then((response) => {
        setSkills(response.data)
        setIsLoading(false)
      })
    })
  }, 400),
  [userIdpPlanData, selectedSkills])


  const handleDeselectSkill = (skillId) => {
    const deletedSkill = selectedSkills.find(skill => Number(skill.id) === skillId)
    const userIdpSkills = selectedSkills.filter(skill => (Number(skill.id) !== skillId)
    && (Number(skill.skillId) !== skillId))
    setSelectedSkills(userIdpSkills)
    // eslint-disable-next-line no-prototype-builtins
    if (deletedSkill?.hasOwnProperty('userIdpPlanId')) {
      debouncedSaveSkills(userIdpSkills)
    }
  }

  const onRemoveSkillFromPlan = (skillId) => {
    const userIdpSkills = selectedSkills.filter(skill => skill.id !== skillId)

    setSelectedSkills(userIdpSkills)
    debouncedSaveSkills(userIdpSkills)
  }

  const handleSelectSkill = (skills) => {
    // Add skillId to skills

    const userIdpSkill = skills.map(skill => ({
      ...skill,
      skillId: skill.id,
    }))
    setSelectedSkills([...selectedSkills, ...userIdpSkill])
  }

  const handleNextForAddSkillsStep = () => {
    setIsLoading(true)

    const planPayload = userIdpPlanData[0]

    const skillPayload = {

      skills: selectedSkills.map(skill => ({
        id: skill.skillId,
        name: skill.name,
      })),
    }

    updatePlan({
      id: planPayload?.id,
      userId: planPayload?.userId.toString(),
      idpTemplateId: planPayload?.idpTemplateId.toString(),
      campaignId: planPayload?.campaignId.toString(),
      active: planPayload?.active,
      creatorId: planPayload?.creatorId.toString(),
      approvalStatus: USER_IDP_PLAN_STATUS.DRAFT,
      ...skillPayload,
    }).then(() => {
      message.success(I18n.t('idp.skills_updated'))
      setIsLoading(false)
      setEditMode(false)
      fetchUserIdpPlan({
        id: idpPlanId as string,
      }).then((res: UserIdpPlan) => {
        setSelectedSkills(res.userIdpSkills)
        setIsLoading(false)
      })
    })
  }

  const resetPlanButton = (
    <ResetPlanButton
      action={() => {
        setIsLoading(true)
        memberAction({
          id: userIdpPlanData[0]?.id,
          action: 'reset',
          method: 'post',
        }).then(() => {
          setIsLoading(false)
          navigate(`${currentPath}/step/getting_started`)
          message.success(I18n.t('admin.idp_plan_reset_success'))
        })
      }}
    />
  )

  const operations = (
    <Flex gap={8}>

      {tab === 'list' && (
        <>
          {
          canResetPlan ? (
            resetPlanButton
          ) : null
          }
          {editMode ? (
            <Button
              type="primary"
              onClick={handleSave}
            >
              {I18n.t('common.actions.save')}
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => setEditMode(true)}
            >
              {I18n.t('common.actions.edit')}
            </Button>
          )}
        </>
      )}
      {
        userIdpPlanData[0]?.status === USER_IDP_PLAN_STATUS.IN_PROGRESS && (
          <>
            <Button
              onClick={() => {
                setIsLoading(true)
                updatePlan({
                  id: userIdpPlanData[0]?.id,
                  status: USER_IDP_PLAN_STATUS.COMPLETED,
                }).then(() => {
                  setIsLoading(false)
                })
              }}
            >
              {I18n.t('idp.mark_as_complete')}
            </Button>

            <Button
              onClick={() => {
                setIsLoading(true)
                updatePlan({
                  id: userIdpPlanData[0]?.id,
                  approvalStatus: USER_IDP_PLAN_STATUS.DRAFT,
                }).then(() => {
                  setIsLoading(false)
                })
              }}
            >
              {I18n.t('idp.convert_to_draft')}
            </Button>
          </>

        )
      }

      {
        userIdpPlanData[0]?.status === USER_IDP_PLAN_STATUS.COMPLETED && (
          <Button
            onClick={() => {
              setIsLoading(true)
              updatePlan({
                id: userIdpPlanData[0]?.id,
                status: USER_IDP_PLAN_STATUS.IN_PROGRESS,
              }).then(() => {
                setIsLoading(false)
              })
            }}
          >
            {I18n.t('idp.mark_as_incomplete')}
          </Button>
        )
      }
    </Flex>
  )


  const skillTypes = [{
    skillType: SKILL_TYPE.BEHAVIORAL,
    skills: allSkills.filter(skill => (skill.skillType === SKILL_TYPE.BEHAVIORAL)),
  }, {
    skillType: SKILL_TYPE.TECHNICAL,
    skills: allSkills.filter(skill => (skill.skillType === SKILL_TYPE.TECHNICAL)),
  }]

  const plan = showAddSkill ? (
    <Flex
      vertical
      className={styles.tabContainer}
      style={{
        maxHeight: '100%',
      }}
    >
      <Button
        onClick={() => setShowAddSkill(false)}
        className={cs(styles.cancelBtn, 'mb-4')}
      >
        {I18n.t('common.actions.cancel')}
      </Button>
      <AddSkillsStep
        addSkillButtonText={I18n.t('idp.my_plan.save_skills')}
        skillTypes={skillTypes}
        onFinishAddSkill={handleFinishAddSkill}
        selectedSkills={selectedSkills.filter(skill => !skill.private)}
        onDeselectSkill={handleDeselectSkill}
        onAddSkill={handleSelectSkill}
        skillGapReportData={null}
        searchSkillResource={searchSkillResource}
        showBackButton={false}
        header={resetPlanButton}
      />
    </Flex>


  ) : (
    <Flex vertical className="ps-4 pe-4">
      <Typography.Title level={4}>{I18n.t('idp.my_plan.development_plan')}</Typography.Title>
      <Tabs
        tabBarExtraContent={tab !== 'reflective_questions'
          ? operations : null}
        activeKey={tab}
        onChange={tab => changeTab(tab)}
      >
        <Tabs.TabPane tab={I18n.t('idp.plan')} key="list">
          <DevelopmentActionListView
            editMode={editMode}
            categories={listData}
            availableDevelopmentActions={availableIDPDevelopmentActions}
            onAddDevelopmentAction={handleAddDevelopmentAction}
            onRemoveDevelopmentAction={handleRemoveDevelopmentAction}
            onUpdateDevelopmentAction={updateDevelopmentAction}
            onShowAvailableDevelopmentAction={handleShowAvailableDevelopmentAction}
            onAddMoreSkills={handleAddMoreSkill}
            onRemoveSkill={onRemoveSkillFromPlan}
            aiAssistantsEnabled={meta?.features?.aiAssistants || false}
          />
        </Tabs.TabPane>
        {userIdpPlanData[0]?.skillGapReportAvailable && (
          <Tabs.TabPane tab={I18n.t('idp.skill_gap_report.title')} key="skill_gap_report">
            <SkillGapReportTab skillGapReportId={userIdpPlanData[0]?.skillGapReportId} />
          </Tabs.TabPane>
        )}
      </Tabs>
    </Flex>
  )

  return (
    <>
      <InformationBanner />
      <Spin size="large" spinning={isLoading}>
        <Flex className={styles.userIdpPlan} justify="center" align="middle" vertical>
          {plan}
        </Flex>
      </Spin>

    </>

  )
}
