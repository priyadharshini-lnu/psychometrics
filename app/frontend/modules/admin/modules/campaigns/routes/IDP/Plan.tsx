import _ from 'lodash'
import { useState, useEffect, useMemo } from 'react'
import {
  Typography, Button, Tabs, Flex, Spin,
} from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import {
  useParams,
} from 'react-router-dom'
import { DevelopmentActionListView } from './DevelopmentActionsFlow/DevelopmentActionListView'
import { AddSkillsStep } from '~/components/IdpShared/AddSkillsStep'
import { groupSkillsBySkillType }
  from '~/modules/endUser/modules/campaigns/routes/idp/MyPlan/utils'
import { useResources } from '~/hooks/useResources'
import {
  UserIdpPlan, UserIdpDevelopmentActions, IdpSkills, UserIdpSkills,
} from '~/modules/admin/modules/campaigns/core/UserIdpPlan'
import { InformationBanner } from './InformationBanner'
import { USER_IDP_PLAN_STATUS } from './constants'
import { useSearchSkills } from './AdminAddSkills/useSearchSkills'

const { I18n } = window

type UserIdpDevelopmentActionPayloadType = UserIdpDevelopmentActions & {_destroy: boolean }

export const Plan = () => {
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [idpDevelopmentActions, setIDPDevelopmentActions] = useState<UserIdpDevelopmentActions[]>([])
  const [idpDevelopmentActionsPayload,
    setIDPDevelopmentActionsPayload] = useState<UserIdpDevelopmentActionPayloadType[]>([])
  const [availableIDPDevelopmentActions, setAvailableIDPDevelopmentActions] = useState<UserIdpDevelopmentActions[]>([])
  const [selectedSkills, setSelectedSkills] = useState<UserIdpSkills[]>([])


  const { idp_plan_id } = useParams()
  const { tab: paramTab } = useParams()

  const [tab, setTab] = useState(paramTab || 'list')

  const {
    data: userIdpPlanData, fetchSingle: fetchUserIdpPlan, updateResource: updatePlan,
  } = useResources<UserIdpPlan>(
    'user_idp_plans',
    {
      apiConfig: {
        include: ['idp_template', 'user_idp_development_actions', 'user_idp_skills'],
      },
    },
  )

  const {
    data: allSkills, fetch: fetchIdpSkillDetails, fetchSingle: fetchSingleSkill, setData: setSkills,
  } = useResources<IdpSkills>(
    'skills', {
      apiConfig: {
        include: ['development_actions'],
      },
    },
  )
  const searchSkillResource = useSearchSkills(userIdpPlanData[0]?.idpTemplateId)

  const {
    collectionAction,
  } = useResources<UserIdpDevelopmentActions>(
    'user_idp_development_actions',
  )

  useEffect(() => {
    fetchUserIdpPlan({
      id: idp_plan_id as string,
    }).then((res: UserIdpPlan) => {
      setSelectedSkills(res.userIdpSkills)
      setIsLoading(false)
    })
  }, [idp_plan_id])

  useEffect(() => {
    if (userIdpPlanData.length) {
      setIDPDevelopmentActions(userIdpPlanData[0]
        ?.userIdpDevelopmentActions)
    }
    setIDPDevelopmentActionsPayload(userIdpPlanData[0]
      ?.userIdpDevelopmentActions as UserIdpDevelopmentActionPayloadType[])
  }, [userIdpPlanData])

  const userIdpSkills = useMemo(() => userIdpPlanData[0]?.userIdpSkills.reduce((acc, skill) => {
    acc[skill.id] = skill
    return acc
  }, {}) ?? [], [userIdpPlanData])

  const normalizedUserIdpDevelopmentActions = useMemo(() => idpDevelopmentActions.reduce((acc, da) => {
    acc[da.id] = da
    return acc
  }, {}) ?? [], [idpDevelopmentActions])


  const listData = useMemo(() => groupSkillsBySkillType(userIdpSkills,
    normalizedUserIdpDevelopmentActions),
  [userIdpSkills, normalizedUserIdpDevelopmentActions])


  // Commenting board data to avoid unnecessary changes
  // const boardData =  useMemo(() => groupDevelopmentActionsBySkillType(normalizedUserIdpDevelopmentActions,
  //   userIdpSkills),
  // [normalizedUserIdpDevelopmentActions, userIdpSkills])

  const changeTab = (tab: string) => {
    setTab(tab)
  }

  const handleShowAvailableDevelopmentAction = (skillId) => {
    fetchSingleSkill({ id: skillId }).then((data: IdpSkills) => {
      setAvailableIDPDevelopmentActions(data.developmentActions)
    })
  }
  const handleAddDevelopmentAction = (developmentAction) => {
    setIDPDevelopmentActions([...idpDevelopmentActions, developmentAction])
    setIDPDevelopmentActionsPayload([...idpDevelopmentActions, developmentAction])
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
    setEditMode(false)
    const idpDaCollection = idpDevelopmentActionsPayload.reduce((acc, da) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const daPayload:any = {}
      daPayload.userIdpPlanId = Number(idp_plan_id)
      daPayload.userIdpSkillId = Number(da.userIdpSkillId)
      daPayload.developmentActionId = da.developmentActionId ? Number(da.developmentActionId) : null
      daPayload.startDateTime = da.startDateTime ?? undefined
      daPayload.endDateTime = da.endDateTime ?? undefined
      daPayload.customAction = da.customAction ?? undefined
      daPayload.customActionLearningStyle = da.customActionLearningStyle ?? undefined
      daPayload.id = Number(da.userIdpDevelopmentActionId) ?? undefined
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
      setIsLoading(false)
    })
  }

  const handleAddMoreSkill = () => {
    setIsLoading(true)
    fetchIdpSkillDetails({
      apiConfig: {
        filter: {
          by_idp_template_id: userIdpPlanData[0]?.idpTemplateId as string,
        },
        include: ['development_actions'],
      },
    }).then((response) => {
      setSkills(response.data)
      setIsLoading(false)
      setShowAddSkill(true)
    })
  }

  const handleFinishAddSkill = () => {
    setShowAddSkill(false)
    handleNextForAddSkillsStep()
  }

  const handleDeselectSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter(skill => skill.skillId !== skillId))
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
      status: USER_IDP_PLAN_STATUS.DRAFT,
      ...skillPayload,
    }).then(() => {
      setIsLoading(false)
      setEditMode(false)
    })
  }

  const operations = (
    <Flex gap={8}>
      {tab === 'list' && (
        editMode ? (
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
        )
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
                  status: USER_IDP_PLAN_STATUS.DRAFT,
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

  const skillCategories = _.map(_.groupBy(allSkills, 'skillType'), (skills, skillType) => ({
    skillType,
    skills,
  }))


  const plan = showAddSkill ? (
    <div>
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={() => setShowAddSkill(false)}
      />
      <AddSkillsStep
        addSkillButtonText={I18n.t('idp.my_plan.save_skills')}
        skillCategories={skillCategories}
        onFinishAddSkill={handleFinishAddSkill}
        selectedSkills={selectedSkills}
        onDeselectSkill={handleDeselectSkill}
        onAddSkill={handleSelectSkill}
        searchSkillResource={searchSkillResource}
      />
    </div>
  ) : (
    <>
      <Typography.Title level={4}>{I18n.t('idp.my_plan.development_plan')}</Typography.Title>
      <Tabs
        tabBarExtraContent={tab !== 'reflective_questions'
          ? operations : null}
        activeKey={tab}
        onChange={tab => changeTab(tab)}
      >
        <Tabs.TabPane tab={I18n.t('idp.list')} key="list">
          <DevelopmentActionListView
            editMode={editMode}
            categories={listData}
            availableDevelopmentActions={availableIDPDevelopmentActions}
            onAddDevelopmentAction={handleAddDevelopmentAction}
            onRemoveDevelopmentAction={handleRemoveDevelopmentAction}
            onUpdateDevelopmentAction={updateDevelopmentAction}
            onShowAvailableDevelopmentAction={handleShowAvailableDevelopmentAction}
            onAddMoreSkills={handleAddMoreSkill}
          />
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab={I18n.t('idp.board')} key="board">
          <DevelopmentActionBoardView developmentActionTypes={boardData} showRating={false} />
        </Tabs.TabPane> */}
      </Tabs>
    </>
  )

  return (
    <>
      <InformationBanner />
      <Flex justify="center" align="middle" vertical style={{ padding: '1rem' }}>
        {isLoading ? (
          <Spin size="large" />
        ) : plan}
      </Flex>
    </>

  )
}
