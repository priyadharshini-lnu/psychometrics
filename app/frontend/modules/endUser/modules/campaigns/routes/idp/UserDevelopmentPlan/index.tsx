import _ from 'lodash'
import {
  useEffect, useState, useMemo, useRef,
} from 'react'
import {
  Tabs, Typography, Button,
  message,
  Row,
  Space,
  Col,
  Tag,
  Splitter,
  Flex,
  Badge,
  Drawer,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { CloseOutlined, MessageOutlined } from '@ant-design/icons'
import { useMedia } from 'use-media'
import { useSearchSkills } from '~/modules/endUser/modules/campaigns/routes/idp/InitialSteps/AddSkills/useSearchSkills'
import { PageLoadSpinner } from '~/glint'
import { Comments } from '~/components/IdpShared/Comments'

import {
  fetchAvailableDevelopmentActions,
  addDevelopmentActionInPlan,
  updateDevelopmentActionInPlan,
  updateDevelopmentActionProgressInPlan,
  fetchUserIdpPlan,
  saveUserIdpSkills,
  fetchIdpSkills,
  fetchUserIdpComments,
  UserIdpCommentsQuery,
  fetchUserIdpCommentById,
  addUserIdpComment,
  markCommentResolved,
  addUserIdpCommentReply,
  showCommentsForSkillId,
  markCommentUnresolved,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'

import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  DevelopmentActionListView,
  DevelopmentAction,
  Skill,
} from '~/components/IdpShared/DevelopmentActions'
import { AddSkillsStep } from '~/components/IdpShared/AddSkillsStep'
import { groupSkillsBySkillType } from './utils'
import { USER_IDP_PLAN_STATUS, STATUS_COLORS } from '~/components/IdpShared/constants'
import { ReflectiveQuestions } from '~/modules/endUser/modules/campaigns/routes/idp/ReflectiveQuestions'
import { Filters } from '~/components/IdpShared/Comments/Types'

const { I18n } = window

const connector = connect((state: RootState) => ({
  currentUser: state.currentUser,
  idpDevelopmentActions: state.campaigns.idp.userIdpDevelopmentActions,
  idpSkills: state.campaigns.idp.userIdpSkills,
  availableDevelopmentActions: state.campaigns.idp.availableDevelopmentActions,
  status: state.campaigns.idp.status,
  idpComments: state.campaigns.idp.userIdpComments,
  idpCommentsTotalCount: state.campaigns.idp.userIdpCommentsTotalCount,
  unreadCommentsCount: state.campaigns.idp.unreadCommentsCount,
}),
{
  fetchAvailableDevelopmentActions,
  addDevelopmentActionInPlan,
  updateDevelopmentActionInPlan,
  updateDevelopmentActionProgressInPlan,
  fetchUserIdpPlan,
  saveUserIdpSkills,
  fetchIdpSkills,
  fetchUserIdpComments,
  fetchUserIdpCommentById,
  addUserIdpComment,
  markCommentResolved,
  addUserIdpCommentReply,
  showCommentsForSkillId,
  markCommentUnresolved,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  idpUserId: string;
  editMode: boolean;
  operations?: React.ReactNode | null;
  viewType?: 'tabs' | 'list';
  header?: React.ReactNode;
}

const UserDevelopmentPlanComponent = ({
  currentUser,
  fetchAvailableDevelopmentActions,
  addDevelopmentActionInPlan,
  updateDevelopmentActionInPlan,
  updateDevelopmentActionProgressInPlan,
  idpDevelopmentActions,
  idpSkills,
  availableDevelopmentActions,
  status,
  fetchUserIdpPlan,
  saveUserIdpSkills,
  fetchIdpSkills,
  idpUserId,
  operations,
  viewType = 'tabs',
  editMode = false,
  // Comments related props from Redux
  idpComments,
  idpCommentsTotalCount,
  fetchUserIdpComments,
  fetchUserIdpCommentById,
  addUserIdpComment,
  markCommentResolved,
  markCommentUnresolved,
  addUserIdpCommentReply,
  showCommentsForSkillId,
  unreadCommentsCount,
  header,
}: Props) => {
  const { tab: paramTab } = useParams() as {tab: string}
  const isMobile = useMedia({
    maxWidth: 768,
  })

  const [tab, setTab] = useState(paramTab || 'list')
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [allSkills, setAllSkills] = useState<Skill[]>(([]))

  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  // Comments state - only isCommentsLoading is managed internally
  const [isCommentsLoading, setIsCommentsLoading] = useState(true)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const [commentsPanelSize, setCommentsPanelSize] = useState(400)

  const listData = useMemo(() => groupSkillsBySkillType(idpSkills, idpDevelopmentActions),
    [idpSkills, idpDevelopmentActions])

  const availableDevelopmentActionsData = useMemo(() => _.values(availableDevelopmentActions),
    [availableDevelopmentActions])

  const navigate = useNavigate()

  const searchSkillResource = useSearchSkills()

  const skillCategories = _.map(_.groupBy(allSkills, 'skillType'), (skills, skillType) => ({
    skillType,
    skills,
  }))

  const changeTab = (tab: string) => {
    setTab(tab)
    navigate(`/idp/my_plan/${tab}`)
  }

  useEffect(() => {
    fetchUserIdpPlan(idpUserId).then(({ response }) => {
      setSelectedSkills(response.data.userIdpSkills)
    }).catch((error) => {
      message.error(error || I18n.t('common.errors.something_wrong'))
      navigate('/')
    })
  }, [])

  useEffect(() => {
    if (paramTab !== tab) {
      setTab(paramTab || 'list')
    }
  }, [paramTab])

  useEffect(() => {
    if (status && status === USER_IDP_PLAN_STATUS.NOT_STARTED && currentUser.id === idpUserId) {
      navigate('/idp/steps/getting_started')
    }
  }, [status])

  useEffect(() => {
    if (showAddSkill) {
      setIsLoading(true)
      fetchIdpSkills().then(({ response }) => {
        setIsLoading(false)
        setAllSkills(response)
      })
    }
  }, [showAddSkill])

  const handleAddDevelopmentAction = (developmentAction: DevelopmentAction) => {
    addDevelopmentActionInPlan(developmentAction)
  }

  const handleShowAvailableDevelopmentAction = (skillId) => {
    fetchAvailableDevelopmentActions(idpUserId, skillId)
  }

  const handleSelectSkill = (skills) => {
    // Add skillId to skills
    const userIdpSkills = skills.map(skill => ({
      ...skill,
      skillId: skill.id,
    }))
    setSelectedSkills([...selectedSkills, ...userIdpSkills])
  }

  const handleFinishAddSkill = () => {
    saveUserIdpSkills(
      selectedSkills, null, idpUserId,
    ).then(() => (
      setShowAddSkill(false)
    ))
  }

  const handleDeselectSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter(skill => (skill.skillId !== skillId)))
  }

  const handleUpdateDevelopmentActionProgress = (developmentAction: Pick<DevelopmentAction, 'id' | 'progress'>) => {
    updateDevelopmentActionProgressInPlan(developmentAction, idpUserId)
  }

  const handleAddMoreSkill = () => {
    setShowAddSkill(true)
  }

  // If no status is available, then it's still loading
  if (!status || isLoading) {
    return <PageLoadSpinner size="large" />
  }

  // Comment-related functions
  const handleShowComments = async (
    filters: Filters = {},
    pagination: { page: number; pageSize: number } = { page: 1, pageSize: 5 },
  ) => {
    setIsCommentsLoading(true)
    const query: UserIdpCommentsQuery = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      q: {
        s: 'created_at desc',
      },
    }
    if (!query.q) query.q = {}
    if (filters?.showResolved) query.q.resolvedEq = true
    if (filters?.showUnread) query.q.unreadByUser = true
    if (filters?.showRead) query.q.unreadByUser = false
    if (filters?.showUnresolved) query.q.resolvedEq = false
    if (filters?.sortOrder) query.q.s = `created_at ${filters?.sortOrder}`
    await fetchUserIdpComments(idpUserId, query).then(() => {
      setIsCommentsLoading(false)
    }).catch(() => {
      setIsCommentsLoading(false)
      message.error(I18n.t('common.errors.something_wrong'))
    })
  }

  const handleScrollToSkill = (resourceId: string) => {
    const skillElement = containerRef.current?.querySelector(`#skill-${resourceId}`)
    if (isMobile) {
      setIsCommentsDrawerOpen(false)
    }
    if (skillElement) {
      skillElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      showCommentsForSkillId(resourceId)
    }
  }

  if (!status) {
    return <PageLoadSpinner size="large" />
  }

  const enhancedOperations = (
    <Flex gap={8}>
      <Badge count={unreadCommentsCount} size="small">
        <Button
          color="default"
          variant="solid"
          icon={<MessageOutlined />}
          onClick={() => setIsCommentsDrawerOpen(!isCommentsDrawerOpen)}
        >
          {I18n.t('idp.comments.comments')}
        </Button>
      </Badge>
      {operations}
    </Flex>
  )

  const handleCollapseChange = (commentId: string) => {
    setIsLoadingReplies(true)
    fetchUserIdpCommentById(idpUserId, commentId).then(() => {
      setIsLoadingReplies(false)
    }).catch(() => {
      setIsLoadingReplies(false)
      message.error(I18n.t('common.errors.something_wrong'))
    })
  }

  const commentsComponent = (
    <Comments
      comments={idpComments || []}
      totalCount={idpCommentsTotalCount}
      onAddComment={(content: string) => {
        addUserIdpComment(idpUserId, {
          content,
          resourceId: null,
          resourceType: null,
        })
      }}
      onAddReply={(content: string, parentId: string) => {
        addUserIdpCommentReply(idpUserId, { content, parentId })
      }}
      onResolveComment={(commentId: string) => {
        markCommentResolved(idpUserId, commentId)
      }}
      onUnresolveComment={(commentId: string) => {
        markCommentUnresolved(idpUserId, commentId)
      }}
      onScrollToSkill={handleScrollToSkill}
      onCollapseChange={handleCollapseChange}
      onFetchComments={handleShowComments}
      onClose={() => setIsCommentsDrawerOpen(false)}
      loading={isCommentsLoading}
      loadingReplies={isLoadingReplies}
      style={{
        flex: 1,
        minHeight: 0,
        height: '100%',
      }}
    />
  )

  const developmentActionViews = isMobile ? (
    <>
      <div
        style={{
          padding: '16px 24px 0 24px',
          overflow: 'auto',
          height: '100%',
        }}
      >
        <div ref={containerRef}>
          <DevelopmentActionListView
            editMode={editMode}
            categories={listData}
            availableDevelopmentActions={availableDevelopmentActionsData}
            onAddDevelopmentAction={handleAddDevelopmentAction}
            onUpdateDevelopmentActionProgress={handleUpdateDevelopmentActionProgress}
            onUpdateDevelopmentAction={updateDevelopmentActionInPlan}
            onShowAvailableDevelopmentAction={handleShowAvailableDevelopmentAction}
            onAddMoreSkills={handleAddMoreSkill}
          />
        </div>
      </div>
      {isMobile && (
        <Drawer
          title={null}
          placement="right"
          closable={false}
          open={isCommentsDrawerOpen}
          width="100%"
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          {commentsComponent}
        </Drawer>
      )}
    </>
  ) : (
    <Splitter
      layout="horizontal"
      onResize={(sizes) => {
        if (sizes && sizes.length > 1 && isCommentsDrawerOpen) {
          setCommentsPanelSize(sizes[1])
        }
      }}
    >
      <Splitter.Panel
        style={{
          padding: '16px 24px 0 24px',
          overflow: 'auto',
          height: '100%',
        }}
      >
        <div ref={containerRef}>
          <DevelopmentActionListView
            editMode={editMode}
            categories={listData}
            availableDevelopmentActions={availableDevelopmentActionsData}
            onAddDevelopmentAction={handleAddDevelopmentAction}
            onUpdateDevelopmentActionProgress={handleUpdateDevelopmentActionProgress}
            onUpdateDevelopmentAction={updateDevelopmentActionInPlan}
            onShowAvailableDevelopmentAction={handleShowAvailableDevelopmentAction}
            onAddMoreSkills={handleAddMoreSkill}
          />
        </div>
      </Splitter.Panel>
      {isCommentsDrawerOpen && (
        <Splitter.Panel
          max={600}
          min={300}
          size={commentsPanelSize}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {commentsComponent}
        </Splitter.Panel>
      )}
    </Splitter>
  )

  const tabItems = [
    {
      label: I18n.t('idp.plan'),
      key: 'plan',
      children: developmentActionViews,
    },
    {
      label: I18n.t('idp.reflective_questions.title'),
      key: 'reflective_questions',
      children: <Flex justify="center" style={{ padding: '16px 24px 0 24px' }}><ReflectiveQuestions /></Flex>,
    },
  ]

  const headerContent = header || (
    <Row align="middle" justify="center" style={{ padding: '24px 24px 0 24px' }}>
      <Col flex="auto">
        <Space>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {I18n.t('idp.my_plan.development_plan')}
          </Typography.Title>
        </Space>
      </Col>
      <Col>
        <Tag color={STATUS_COLORS[status]}>{I18n.t(`idp.user_idp_status.${status}`)}</Tag>
      </Col>
    </Row>
  )

  if (showAddSkill) {
    return (
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
    )
  }
  return (
    <>
      { viewType === 'tabs'
        ? (
          <>
            {headerContent}
            <Tabs
              onChange={changeTab}
              tabBarExtraContent={tab !== 'reflective_questions' ? enhancedOperations : null}
              items={tabItems}
              tabBarStyle={{
                marginBottom: 0,
                padding: '0 24px',
              }}
            />
          </>
        ) : developmentActionViews}
    </>

  )
}

export default connector(UserDevelopmentPlanComponent)
