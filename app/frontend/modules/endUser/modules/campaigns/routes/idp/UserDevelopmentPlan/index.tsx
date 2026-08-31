import _, { uniqBy } from 'lodash'
import {
  useEffect, useState, useMemo, useRef, useContext,
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
  Drawer, Tooltip,
  Spin, Popover,
} from 'antd'
import cs from 'classnames'
import { useNavigate, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import {
  MessageOutlined,
  InfoCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { DownloadButton } from '~/components/IdpShared/DownloadButton'
import { useSearchSkills } from '~/modules/endUser/modules/campaigns/routes/idp/InitialSteps/AddSkills/useSearchSkills'
import { PageLoadSpinner, MediaQueryContext } from '~/glint'
import { Comments, CommentsForSkill } from '~/components/IdpShared/Comments'
import { SkillGapReportTab }
  from '~/modules/endUser/modules/campaigns/routes/idp/InitialSteps/SkillGapReport/SkillGapReportTab'
import styles from './styles.less'
import { useAppSelector } from '~/modules/endUser/store/hooks'
import { getReflectiveQuestions } from '~/modules/endUser/modules/campaigns/core/idp/idpPlanRtk'

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
  fetchUserIdpPlanChanges,
  setUserIdpPlanDirty,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'

import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  DevelopmentAction,
  Skill,
} from '~/components/IdpShared/DevelopmentActions'
import {
  DevelopmentActionListView,
} from '../DevelopmentActionsFlow/DevelopmentActionListView'
import { AddSkillsStep } from '~/components/IdpShared/AddSkillsStep'
import { groupSkillsBySkillType } from './utils'
import { USER_IDP_PLAN_STATUS, STATUS_COLORS, SKILL_TYPE } from '~/components/IdpShared/constants'
import { ListView } from '~/modules/endUser/modules/campaigns/routes/idp/ReflectiveQuestions'
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
  skillGapReportAvailable: state.campaigns.idp.skillGapReportAvailable,
  skillGapReportData: state.campaigns.idp.skillGapReportData,
  oneClickIdpEnabled: state.campaigns.idp.oneClickIdpEnabled,
  reviewNote: state.campaigns.idp.reviewNote,
  approvalStatus: state.campaigns.idp.approvalStatus,
  aiAssistedIdpFeatureEnabled: state.config.idp.aiAssistedIdpFeatureEnabled,
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
  fetchUserIdpPlanChanges,
  setUserIdpPlanDirty,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  idpUserId: string;
  editMode: boolean;
  operations?: React.ReactNode | null;
  viewType?: 'tabs' | 'list';
  header?: React.ReactNode;
  headerHeight?: number;
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
  fetchUserIdpPlanChanges,
  unreadCommentsCount,
  header,
  skillGapReportAvailable,
  skillGapReportData,
  headerHeight = 0,
  oneClickIdpEnabled,
  reviewNote,
  setUserIdpPlanDirty,
  aiAssistedIdpFeatureEnabled,
  approvalStatus,
}: Props) => {
  const { tab: paramTab } = useParams() as {tab: string}

  const { isMobile, isTablet, isDesktop } = useContext(MediaQueryContext)

  const [tab, setTab] = useState(paramTab)
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [allSkills, setAllSkills] = useState<Skill[]>(([]))

  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])
  const [existingPlanData, setExistingPlanData] = useState<object | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isDALoading, setIsDALoading] = useState(false)
  const [isSkillsLoading, setIsSkillsLoading] = useState(false)

  const [skillForComment, setSkillForComment] = useState<
  { skillId: string, skillName: string } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)


  // Comments state - only isCommentsLoading is managed internally
  const [isCommentsLoading, setIsCommentsLoading] = useState(true)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const [commentsPanelSize, setCommentsPanelSize] = useState(400)
  const reflectionQuestions = useAppSelector(getReflectiveQuestions)

  const listData = useMemo(() => groupSkillsBySkillType(idpSkills, idpDevelopmentActions),
    [idpSkills, idpDevelopmentActions, selectedSkills])

  const isPlanDirty = useMemo(() => {
    if (!existingPlanData) return false
    const { userIdpSkills: existingSkills, userIdpDevelopmentActions: existingActions } = existingPlanData as {
      userIdpSkills: Skill[];
      userIdpDevelopmentActions: DevelopmentAction[];
    }

    return !_.isEqual(
      Object.values(existingSkills).map(skill => _.omit(skill as Skill, ['changeStatus', 'description'])),
      Object.values(idpSkills).map(skill => _.omit(skill as Skill, ['changeStatus', 'description'])),
    ) || !_.isEqual(
      existingActions,
      idpDevelopmentActions,
    )
  },
  [idpSkills, idpDevelopmentActions, existingPlanData])


  const availableDevelopmentActionsData = useMemo(() => _.values(availableDevelopmentActions),
    [availableDevelopmentActions])

  const navigate = useNavigate()

  const searchSkillResource = useSearchSkills()

  const skillTypes = [{
    skillType: SKILL_TYPE.BEHAVIORAL,
    skills: allSkills.filter(skill => (skill.skillType === SKILL_TYPE.BEHAVIORAL)),
  }, {
    skillType: SKILL_TYPE.TECHNICAL,
    skills: allSkills.filter(skill => (skill.skillType === SKILL_TYPE.TECHNICAL)),
  }]

  const changeTab = (tab: string) => {
    setTab(tab)
    if (idpUserId !== currentUser.id) {
      navigate(`/idp/direct_reportees/${idpUserId}/${tab}`)
    } else {
      navigate(`/idp/my_plan/${tab}`)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchUserIdpPlan(idpUserId).then(({ response }) => {
      setSelectedSkills(response.data.userIdpSkills.filter(skill => !skill.deletedAt))
      fetchUserIdpPlanChanges(idpUserId).then(() => {
        setExistingPlanData({
          userIdpDevelopmentActions: _.keyBy(response.data.userIdpDevelopmentActions, 'id'),
          userIdpSkills: _.keyBy(response.data.userIdpSkills, 'id'),
        })
      })

      setIsLoading(false)
    }).catch((error) => {
      message.error(error || I18n.t('common.errors.something_wrong'))
      navigate('/')
    })
  }, [editMode])

  useEffect(() => {
    if (paramTab !== tab) {
      setTab(paramTab)
    }
  }, [paramTab])

  useEffect(() => {
    if (currentUser.id === idpUserId) {
      // Use approvalStatus to check AI assisted IDP in progress
      // This is because status will be NOT_STARTED even when approvalStatus is AI_ASSISTED_IDP_IN_PROGRESS
      if (approvalStatus === USER_IDP_PLAN_STATUS.AI_ASSISTED_IDP_IN_PROGRESS) {
        navigate('/idp/ai_assistant/chat')
        return
      }

      if (status === USER_IDP_PLAN_STATUS.NOT_STARTED) {
        const welcome_page = (aiAssistedIdpFeatureEnabled && oneClickIdpEnabled)
          ? '/idp/ai_assistant/start' : '/idp/steps/getting_started'
        navigate(welcome_page)
      }
    }
  }, [status, approvalStatus])

  useEffect(() => {
    if (showAddSkill) {
      setIsLoading(true)
      fetchIdpSkills().then(({ response }) => {
        setIsLoading(false)
        setAllSkills(response)
      })
    }
  }, [showAddSkill])

  useEffect(() => {
    if (skillForComment && !isMobile) {
      setIsCommentsDrawerOpen(true)
    }
  }, [skillForComment])

  useEffect(() => {
    setUserIdpPlanDirty(isPlanDirty)
  }, [isPlanDirty])

  const handleAddDevelopmentAction = (developmentActionsObj) => {
    addDevelopmentActionInPlan(developmentActionsObj)
  }

  const handleShowAvailableDevelopmentAction = (skillId) => {
    setIsDALoading(true)
    fetchAvailableDevelopmentActions(idpUserId, skillId).then(() => {
      setIsDALoading(false)
    })
  }

  const handleSelectSkill = (skills) => {
    // Add skillId to skills
    const userIdpSkills = skills.map(skill => ({
      ...skill,
      skillId: skill.id,
      isLocal: true,
      deletedAt: null,
    }))

    setSelectedSkills([...selectedSkills, ...userIdpSkills])
  }

  const handleFinishAddSkill = () => {
    setIsLoading(true)
    saveUserIdpSkills(
      uniqBy(selectedSkills, 'skillId'), null, idpUserId,
    ).then(({ response }: {response:{data:Skill[]}}) => {
      setSelectedSkills([...response.data])
      fetchUserIdpPlanChanges(idpUserId)
      setShowAddSkill(false)
      message.success(I18n.t('idp.skills_updated'))
    }).catch((error) => {
      message.error(error)
    })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const debouncedSaveSkills = useMemo(() => _.debounce((userIdpSkills) => {
    setIsSkillsLoading(true)
    saveUserIdpSkills(
      userIdpSkills, null, idpUserId,
    ).then(({ response }:{response:{data:Skill[]}}) => {
      setSelectedSkills([...response.data])
      fetchUserIdpPlanChanges(idpUserId)
      fetchIdpSkills().then(({ response }) => {
        setAllSkills(response)
      }).finally(() => {
        setIsSkillsLoading(false)
      })
    })
  }, 400),
  [idpUserId, saveUserIdpSkills])

  const handleDeselectSkill = (skillId) => {
    const deletedSkill = selectedSkills.find(skill => (skill.id === skillId))
    const userIdpSkills = selectedSkills.filter(userIdpSkill => userIdpSkill.id !== skillId
      && userIdpSkill.skillId !== skillId)
    setSelectedSkills(userIdpSkills)
    // eslint-disable-next-line no-prototype-builtins
    if (!deletedSkill?.hasOwnProperty('isLocal')) { debouncedSaveSkills(userIdpSkills) }
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
    const skillElement:HTMLElement = containerRef.current?.querySelector(`#skill-${resourceId}`) as HTMLElement
    if (isMobile) {
      setIsCommentsDrawerOpen(false)
    } else if (skillElement) {
      skillElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
      setTimeout(() => {
        showCommentsForSkillId(resourceId)
      }, 400)
    }
    setTimeout(() => {
      if (skillElement) {
        skillElement.style.backgroundColor = 'var(--ant-primary-1)'
        skillElement.style.transition = 'background-color 0.8s'
        setTimeout(() => {
          skillElement.style.backgroundColor = ''
        }, 2000)
        skillElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
      }
    }, 400)
  }

  if (!status) {
    return <PageLoadSpinner size="large" />
  }

  const enhancedOperations = (
    <Flex className={(isTablet || isDesktop) ? 'mt-4 mb-4' : ''} justify="end" gap={8}>
      {tab === 'skill_gap_report' ? (
        skillGapReportAvailable && skillGapReportData && (
          <DownloadButton
            disabled={skillGapReportData?.status !== 'prepared'}
            href={skillGapReportData?.report_url}
          >
            {I18n.t('idp.skill_gap_report.download')}
          </DownloadButton>
        )
      ) : (
        <>
          {operations}
          <Badge count={unreadCommentsCount} size="small">
            <Tooltip placement="topLeft" title={I18n.t('idp.comment_details.add_comments')}>
              <Button
                color="default"
                aria-label={I18n.t('idp.add_comments')}
                icon={<MessageOutlined />}
                style={{
                  backgroundColor: isCommentsDrawerOpen ? '#0B0B0B' : 'transparent',
                  color: isCommentsDrawerOpen ? 'white' : 'inherit',
                }}
                onClick={() => {
                  setIsCommentsDrawerOpen(!isCommentsDrawerOpen)
                  if (isCommentsDrawerOpen) {
                    setSkillForComment(null)
                  }
                }}
              />
            </Tooltip>

          </Badge>
        </>
      )}
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
        className={styles.tabContainer}
        style={{
          height: '100%',
        }}
      >
        <div ref={containerRef}>
          <DevelopmentActionListView
            editMode={editMode}
            categories={listData}
            userId={currentUser.id !== idpUserId ? idpUserId : currentUser.id}
            availableDevelopmentActions={availableDevelopmentActionsData}
            onAddDevelopmentAction={handleAddDevelopmentAction}
            onUpdateDevelopmentActionProgress={handleUpdateDevelopmentActionProgress}
            onUpdateDevelopmentAction={updateDevelopmentActionInPlan}
            onShowAvailableDevelopmentAction={handleShowAvailableDevelopmentAction}
            onAddMoreSkills={handleAddMoreSkill}
            isDALoading={isDALoading}
            setSkillForComment={setSkillForComment}
            onRemoveSkill={handleDeselectSkill}
          />
        </div>
      </div>
      {isMobile && (
        skillForComment ? (
          <CommentsForSkill
            skillForComment={skillForComment}
            onClose={() => {
              setSkillForComment(null); setIsCommentsDrawerOpen(false)
            }}
            onScrollToSkill={handleScrollToSkill}
          />
        )
          : (
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
          )
      )}
    </>
  ) : (
    <Splitter
      orientation="horizontal"
      onResize={(sizes) => {
        if (sizes && sizes.length > 1 && isCommentsDrawerOpen) {
          setCommentsPanelSize(sizes[1])
        }
      }}
    >
      <Splitter.Panel
        className={styles.tabContainer}
        style={{
          maxHeight: `calc(100vh - (220px + ${headerHeight}px))`,
        }}
      >
        <div
          ref={containerRef}
          style={{
            height: '100%',
          }}
        >
          <DevelopmentActionListView
            editMode={editMode}
            categories={listData}
            userId={currentUser.id !== idpUserId ? idpUserId : currentUser.id}
            availableDevelopmentActions={availableDevelopmentActionsData}
            onAddDevelopmentAction={handleAddDevelopmentAction}
            onUpdateDevelopmentActionProgress={handleUpdateDevelopmentActionProgress}
            onUpdateDevelopmentAction={updateDevelopmentActionInPlan}
            onShowAvailableDevelopmentAction={handleShowAvailableDevelopmentAction}
            onAddMoreSkills={handleAddMoreSkill}
            isDALoading={isDALoading}
            isViewingReportee={currentUser.id !== idpUserId}
            setSkillForComment={setSkillForComment}
            onRemoveSkill={handleDeselectSkill}
          />
        </div>
      </Splitter.Panel>
      {isCommentsDrawerOpen && (
        <Splitter.Panel
          max={600}
          min={300}
          size={commentsPanelSize}
          className="flex flex-column"
          style={{
            overflowY: 'hidden',
            maxHeight: `calc(100vh - (220px + ${headerHeight}px))`,
          }}
        >
          {skillForComment ? (
            <CommentsForSkill
              skillForComment={skillForComment}
              onClose={() => {
                setSkillForComment(null); setIsCommentsDrawerOpen(false)
              }}
              onScrollToSkill={handleScrollToSkill}
            />
          ) : commentsComponent}
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
    ...(
      skillGapReportAvailable ? [
        {
          label: I18n.t('idp.skill_gap_report.title'),
          key: 'skill_gap_report',
          children:
        <Flex
          justify="center"
          className={styles.tabContainer}
          style={{
            maxHeight: `calc(100vh - (220px + ${headerHeight}px))`,
          }}
        >
          <SkillGapReportTab />
        </Flex>,
        },
      ]
        : []

    ),
    ...(
      currentUser.id === idpUserId && reflectionQuestions.length > 0
        ? [
          {
            label: I18n.t('idp.reflective_questions.title'),
            key: 'reflective_questions',
            children:
          <Flex
            vertical
            align="start"
            className={styles.tabContainer}
            style={{
              maxHeight: 'calc(100vh - 220px)',
              overflowY: 'auto',
            }}
          >
            <ListView />
          </Flex>,
          },
        ]
        : []
    ),
  ]

  const headerContent = header || (
    <Row align="middle" justify="center" className={cs('mt-2 mb-2', isMobile ? '' : 'ps-6 pe-6')}>
      <Col flex="auto">
        <Space>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {I18n.t('idp.my_plan.development_plan')}
          </Typography.Title>
        </Space>
      </Col>
      <Col>
        <Tag
          aria-label={I18n.t('idp.plan_status', { status: I18n.t(`idp.user_idp_status.${status}`) })}
          className="me-0"
          color={STATUS_COLORS[status]}
        >
          {I18n.t(`idp.user_idp_status.${status}`)}
        </Tag>
        <Popover
          placement="bottomLeft"
          title={(
            <span>
              {status === USER_IDP_PLAN_STATUS.REJECTED ? I18n.t('enduser.reason_for_idp_plan_rejection')
                : I18n.t('enduser.idp_plan_approval_note')}
            </span>
              )}
          trigger={['click']}
          content={reviewNote}
        >
          {reviewNote && ([USER_IDP_PLAN_STATUS.REJECTED, USER_IDP_PLAN_STATUS.APPROVED].includes(status)) && (
            <Button
              style={{
                height: '1.4rem',
                width: '1rem',
                color: 'inherit',
              }}
              type="link"
              className="p-0 ms-1"
              icon={<InfoCircleOutlined />}
            />
          )}
        </Popover>
      </Col>
    </Row>
  )


  if (showAddSkill) {
    return (
      <Flex
        vertical
        className={cs(styles.tabContainer, 'p-4')}
        style={{
          maxHeight: 'calc(100vh - 116px)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Spin spinning={isSkillsLoading} style={{ maxHeight: '100%', overflowY: 'auto' }}>
          <AddSkillsStep
            addSkillButtonText={I18n.t('idp.my_plan.save_skills')}
            skillTypes={skillTypes}
            onFinishAddSkill={handleFinishAddSkill}
            selectedSkills={selectedSkills}
            onDeselectSkill={handleDeselectSkill}
            onAddSkill={handleSelectSkill}
            searchSkillResource={searchSkillResource}
            showBackButton
            prev={() => {
              setShowAddSkill(false)
            }}
            allowSkillDeletion={false}
            skillGapReportData={null}
          />
        </Spin>
      </Flex>
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
              activeKey={tab}
              className={styles.userIdpPlan}
              tabBarStyle={{
                marginBottom: 0,
                padding: isMobile ? '0' : '0 24px',
                boxShadow: '0 2px 2px var(--shadow-color)',
                flexWrap: 'wrap',
                flexDirection: isMobile ? 'column' : 'row',
              }}
            />
          </>
        ) : developmentActionViews}
    </>

  )
}

export default connector(UserDevelopmentPlanComponent)
