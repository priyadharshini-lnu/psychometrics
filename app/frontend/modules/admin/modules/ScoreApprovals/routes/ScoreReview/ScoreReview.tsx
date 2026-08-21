import {
  Col, Row, Tabs, Flex, Button, Space, message, Card,
  Typography, Popconfirm, Alert,
} from 'antd'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import humps from 'humps'
import {
  LeftOutlined, InfoCircleOutlined, CheckCircleFilled, ReloadOutlined,
  SyncOutlined, ExclamationCircleFilled,
} from '~/glint/icons/AccessibleIconsAntDesign'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { QuestionScore } from './QuestionScore'
import AllResponsesList, { SubjectAssessment } from './AllResponsesList'
import { useResources } from '~/hooks/useResources'
import { ScoreApproval, Indicator } from '../../core'
import { APPROVAL_STATUS } from '../TasksList'
import styles from './ScoreReview.less'

const { I18n } = window

export const ScoreReview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState<string>()
  const [showAllResponsesModal, setShowAllResponsesModal] = useState(false)
  const [cachedAssessment, setCachedAssessment] = useState<SubjectAssessment | null>(null)
  const {
    fetchSingle, data, isLoading, memberAction, setData,
  } = useResources<ScoreApproval>('ai_score_approvals')

  useEffect(() => {
    if (id) {
      fetchSingle({ id })
    }
  }, [id])

  const scoreApproval = data[0]

  const fetchAssessment = (scoreApprovalId: string) => {
    if (cachedAssessment) {
      return Promise.resolve(cachedAssessment)
    }

    return memberAction({
      id: scoreApprovalId,
      method: 'get',
      action: 'subject_assessment',
    }).then((result) => {
      const assessmentData = result as SubjectAssessment
      setCachedAssessment(assessmentData)
      return assessmentData
    })
  }

  if (!id || isLoading(`fetch@${id}`) || !scoreApproval || !scoreApproval.questions) {
    return
  }

  const filteredQuestions = (
    scoreApproval.questions.filter(question => scoreApproval.competencies.find(c => c.questionId === question.id)
      || scoreApproval.indicators[question.id])
  )

  const updateCompetenciesAndIndicators = (scoreApproval, data) => {
    const camelizedData = humps.camelizeKeys(data)
    const newScoreApproval = {
      ...scoreApproval,
    }

    camelizedData.forEach((factor) => {
      if (factor.parentFactorId) {
        newScoreApproval.indicators[factor.questionId] = newScoreApproval.indicators[factor.questionId].map(
          c => (c.id === factor.id ? factor : c),
        )
      } else {
        newScoreApproval.competencies = newScoreApproval.competencies.map(
          c => (c.id === factor.id ? factor : c),
        )
      }
    })
    setData([newScoreApproval])
    return newScoreApproval
  }

  const allQuestionsReachedStatus = (updatedApproval: ScoreApproval) => {
    const requiredStatus = updatedApproval.reviewAs === 'assessor' ? 'assessor_approved' : 'approver_approved'

    const allIndicatorsApproved = Object.values(updatedApproval.indicators)
      .flat()
      .every(i => i.status === 'approver_approved' || i.status === requiredStatus)

    const allCompetenciesApproved = updatedApproval.competencies
      .filter(c => c.scoringType === 'ai')
      .every(c => c.status === 'approver_approved' || c.status === requiredStatus)

    return allIndicatorsApproved && allCompetenciesApproved
  }

  const overrideScore = (scoreId, { score, reason, notApplicable }) => (
    memberAction({
      id,
      method: 'post',
      action: 'override_score',
      body: {
        factorScoreId: scoreId, score, reason, notApplicable,
      },
    }).then((data) => {
      updateCompetenciesAndIndicators(scoreApproval, data)
    }).catch((error) => {
      message.error(error?.error || error?.base?.[0]?.title)
    })
  )

  const discardScore = scoreId => (
    memberAction({
      id,
      method: 'post',
      action: 'discard_score',
      body: {
        factorScoreId: scoreId,
      },
    }).then((data) => {
      updateCompetenciesAndIndicators(scoreApproval, data)
    }).catch((error) => {
      message.error(error?.error || error?.base?.[0]?.title)
    })
  )

  const approveQuestion = (questionId) => {
    memberAction({
      id,
      method: 'post',
      action: 'approve_question',
      body: {
        questionId,
      },
    }).then((data: Indicator[]) => {
      const updatedApproval = updateCompetenciesAndIndicators(scoreApproval, data)
      if (allQuestionsReachedStatus(updatedApproval)) {
        fetchSingle({ id })
      }
      nextQuestion(questionId)
    }).catch((error) => {
      message.error(error?.base?.[0]?.title)
    })
  }

  const discardQuestion = (questionId) => {
    memberAction({
      id,
      method: 'post',
      action: 'discard_question',
      body: {
        questionId,
      },
    }).then((data: Indicator[]) => {
      const updatedApproval = updateCompetenciesAndIndicators(scoreApproval, data)
      if (allQuestionsReachedStatus(updatedApproval)) {
        fetchSingle({ id })
      }
    }).catch((error) => {
      message.error(error?.base?.[0]?.title)
    })
  }

  const approveAll = () => {
    memberAction({
      id,
      method: 'post',
      action: 'approve_all_questions',
      body: {},
    }).then((data: ScoreApproval) => {
      const camelizedData = humps.camelizeKeys(data)
      setData([camelizedData])
      // updateCompetenciesAndIndicators({ ...scoreApproval, allowApprove: false }, data)
    }).catch((error) => {
      message.error(error?.base?.[0]?.title)
    })
  }

  const discardAll = () => {
    memberAction({
      id,
      method: 'post',
      action: 'discard_all_questions',
      body: {},
    }).then((data: ScoreApproval) => {
      const camelizedData = humps.camelizeKeys(data)
      setData([camelizedData])
    }).catch((error) => {
      message.error(error?.base?.[0]?.title)
    })
  }

  const handleRescore = () => {
    memberAction({
      id,
      method: 'post',
      action: 'rescore',
      body: {},
    }).then(() => {
      message.success(I18n.t('admin.ai_scoring_rescore_queued'))
    }).catch((error) => {
      message.error(error?.error || error?.base?.[0]?.title)
    })
  }

  const handleResetApproval = () => {
    memberAction({
      id,
      method: 'post',
      action: 'reset_approval',
      body: {},
    }).then(() => {
      message.success(I18n.t('admin.score_approval_reset_success'))
      fetchSingle({ id })
    }).catch((error) => {
      message.error(error?.error || error?.base?.[0]?.title)
    })
  }

  const showStaleBanner = scoreApproval.resultStale

  const nextQuestion = (questionId) => {
    const index = filteredQuestions.findIndex(q => q.id === questionId)
    const status = scoreApproval.reviewAs === 'assessor' ? 'assessor_approved' : 'approver_approved'

    const isQuestionApproved = question => (
      scoreApproval.indicators[question.id]
        ?.every(i => i.status === 'approver_approved' || i.status === status)
    )

    const allQuestionsApproved = filteredQuestions.every(q => isQuestionApproved(q))

    if (allQuestionsApproved && scoreApproval.approvedBy) {
      const nextIndex = (index + 1) % filteredQuestions.length
      setCurrentTab(filteredQuestions[nextIndex].id)
      return
    }

    const questionsAfter = filteredQuestions.slice(index + 1)
    const nextPending = questionsAfter.find(q => !isQuestionApproved(q))

    if (nextPending) {
      setCurrentTab(nextPending.id)
    } else if (!isQuestionApproved(filteredQuestions[index])) {
      // If current question is pending and no more pending questions, stay on it


    } else {
      const firstPending = filteredQuestions.find(q => !isQuestionApproved(q))
      if (firstPending) {
        setCurrentTab(firstPending.id)
      }
    }
  }

  const status = scoreApproval.reviewAs === 'assessor' ? 'assessor_approved' : 'approver_approved'
  const { allowApprove } = scoreApproval

  const items = filteredQuestions.map((question, index) => {
    const approved = scoreApproval.indicators[question.id]
      ?.every(i => i.status === 'approver_approved' || i.status === status)

    return {
      key: question.id,
      label: (
        <Space>
          {approved ? <CheckCircleFilled style={{ color: 'var(--ant-primary-color)' }} /> : <InfoCircleOutlined />}
          {`Question ${index + 1}`}
        </Space>
      ),
      children: <QuestionScore
        question={question}
        competencies={scoreApproval.competencies}
        indicators={scoreApproval.indicators[question.id]}
        result={scoreApproval.results[question.id]}
        mediaResponse={scoreApproval.mediaResponses[question.id]}
        highlightAnchors={scoreApproval.highlightAnchors?.[question.id]}
        overrideScore={overrideScore}
        discardScore={discardScore}
        approveQuestion={approveQuestion}
        nextQuestion={nextQuestion}
        discardQuestion={discardQuestion}
        allowApprove={allowApprove}
        approved={approved}
        lastQuestion={filteredQuestions.length === index + 1}
      />,
    }
  })
  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('admin.dashboard'),
          },
          {
            label: () => I18n.t('admin.scoring_approval_score_approvals'),
            link: () => '/admin/ai_scoring_approvals',
          },
          {
            label: () => I18n.t('admin.scoring_approval_review'),
            // add user email
          },
        ]}
      />

      <Row justify="center">
        <Col flex={1} style={{ padding: 16, maxWidth: 1200 }}>
          <Flex vertical gap={12}>
            <Flex justify="space-between">
              <Button type="text" style={{ padding: 0 }} icon={<LeftOutlined />} onClick={() => navigate(-1)}>
                {I18n.t('shared.back')}
              </Button>
              <Flex gap={8}>
                {scoreApproval.allowReset && (
                  <Popconfirm
                    title={I18n.t('admin.score_approval_reset_title')}
                    description={
                      ['approver_approved', 'auto_approved'].includes(scoreApproval.approvalStatus)
                        ? I18n.t('admin.score_approval_reset_recompute_description')
                        : I18n.t('admin.score_approval_reset_description')
                    }
                    onConfirm={handleResetApproval}
                    okText={I18n.t('shared.ok')}
                    cancelText={I18n.t('shared.cancel')}
                  >
                    <Button danger icon={<ReloadOutlined />}>
                      {I18n.t('admin.score_approval_reset')}
                    </Button>
                  </Popconfirm>
                )}
                {allowApprove && scoreApproval.allowBulkApproveScores && (
                  <>
                    <Popconfirm
                      title={I18n.t('admin.discard_all_questions_title')}
                      description={I18n.t('admin.discard_all_questions_description')}
                      onConfirm={discardAll}
                      okText={I18n.t('shared.ok')}
                      cancelText={I18n.t('shared.cancel')}
                    >
                      <Button icon={<ReloadOutlined />}>
                        {I18n.t('admin.discard_all_questions')}
                      </Button>
                    </Popconfirm>
                    <Button type="primary" onClick={approveAll}>
                      {I18n.t('admin.approve_all_questions')}
                    </Button>
                  </>
                )}
              </Flex>
            </Flex>
            <Card
              classNames={{ body: styles.headerCard }}
              styles={{ root: { borderRadius: 8, border: '1px solid #e8e8e8' } }}
            >
              <Flex flex={1}>
                <Flex vertical gap={24} flex={1}>
                  <Flex vertical>
                    <Typography.Text className={styles.label}>
                      {I18n.t('shared.campaign')}
                    </Typography.Text>
                    <Typography.Text strong>
                      {scoreApproval.campaignName}
                    </Typography.Text>
                  </Flex>
                  <Flex vertical>
                    <Typography.Text className={styles.label}>
                      {I18n.t('shared.subject')}
                    </Typography.Text>
                    <Typography.Text strong>
                      {scoreApproval.subjectName}
                    </Typography.Text>
                  </Flex>
                </Flex>
                <Flex vertical gap={24} flex={1}>
                  <Flex vertical>
                    <Typography.Text className={styles.label}>
                      {I18n.t('shared.client')}
                    </Typography.Text>
                    <Typography.Text strong>
                      {scoreApproval.clientName}
                    </Typography.Text>
                  </Flex>
                  <Flex vertical>
                    <Typography.Text className={styles.label}>
                      {I18n.t('shared.email')}
                    </Typography.Text>
                    <Typography.Text strong copyable>
                      {scoreApproval.subjectEmail}
                    </Typography.Text>
                  </Flex>
                </Flex>
                <Flex vertical gap={24} flex={1}>
                  <Flex vertical>
                    <Typography.Text className={styles.label}>
                      {I18n.t('shared.project')}
                    </Typography.Text>
                    <Typography.Text strong>
                      {scoreApproval.projectName}
                    </Typography.Text>
                  </Flex>
                  <Flex vertical>
                    <Typography.Text className={styles.label}>
                      {I18n.t('shared.assessed_by')}
                    </Typography.Text>
                    <Typography.Text strong>
                      {scoreApproval.assessedBy}
                    </Typography.Text>
                  </Flex>
                </Flex>
                <Flex vertical gap={24} flex={1}>
                  <Flex vertical>
                    <Typography.Text className={styles.label}>
                      {I18n.t('shared.approval_status')}
                    </Typography.Text>
                    <Typography.Text>
                      {APPROVAL_STATUS[scoreApproval.approvalStatus]}
                    </Typography.Text>
                  </Flex>
                  <Flex vertical>
                    <Typography.Text className={styles.label}>
                      {I18n.t('shared.approved_by')}
                    </Typography.Text>
                    <Typography.Text strong>
                      {scoreApproval.approvedBy}
                    </Typography.Text>
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          </Flex>
          {showStaleBanner && (
            <Alert
              type="warning"
              showIcon
              icon={<ExclamationCircleFilled className={styles.staleBannerIcon} />}
              message={<Typography.Text strong>{I18n.t('admin.ai_scoring_approval_stale_title')}</Typography.Text>}
              description={I18n.t('admin.ai_scoring_approval_stale_description')}
              action={(
                <Popconfirm
                  title={I18n.t('admin.ai_scoring_refresh_score_confirm_title')}
                  description={I18n.t('admin.ai_scoring_refresh_score_confirm_description')}
                  onConfirm={handleRescore}
                  okText={I18n.t('shared.ok')}
                  cancelText={I18n.t('shared.cancel')}
                >
                  <Button size="small" icon={<SyncOutlined />}>
                    {I18n.t('admin.ai_scoring_refresh_score')}
                  </Button>
                </Popconfirm>
              )}
              className={styles.staleBanner}
            />
          )}
          <Flex justify="space-between" align="center">
            <Typography.Title level={3} className="mt24">
              {scoreApproval.assessmentName}
            </Typography.Title>
            <Button onClick={() => setShowAllResponsesModal(true)}>
              {I18n.t('admin.show_all_assessment_responses')}
            </Button>
          </Flex>
          <Tabs
            className={styles.questionTabs}
            items={items}
            defaultActiveKey={items[0]?.key}
            activeKey={currentTab}
            onChange={setCurrentTab}
          />
        </Col>
      </Row>

      <AllResponsesList
        scoreApprovalId={id}
        open={showAllResponsesModal}
        onClose={() => setShowAllResponsesModal(false)}
        fetchAssessment={fetchAssessment}
      />
    </>
  )
}
