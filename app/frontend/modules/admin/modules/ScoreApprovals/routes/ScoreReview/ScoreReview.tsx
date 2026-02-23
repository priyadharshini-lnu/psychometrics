import {
  Col, Row, Tabs, Flex, Button, Space, message, Card,
  Typography,
} from 'antd'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import humps from 'humps'
import {
  LeftOutlined, InfoCircleOutlined, CheckCircleFilled,
} from '~/glint/icons/AccessibleIconsAntDesign'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { QuestionScore } from './QuestionScore'
import { useResources } from '~/hooks/useResources'
import { ScoreApproval, Indicator } from '../../core'
import { APPROVAL_STATUS } from '../TasksList'
import styles from './ScoreReview.less'

const { I18n } = window

export const ScoreReview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState<string>()
  const {
    fetchSingle, data, isLoading, memberAction, setData,
  } = useResources<ScoreApproval>('ai_score_approvals')

  useEffect(() => {
    if (id) {
      fetchSingle({ id })
    }
  }, [id])

  const scoreApproval = data[0]

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
        newScoreApproval.indicators[factor.questionId] = scoreApproval.indicators[factor.questionId].map(
          c => (c.id === factor.id ? factor : c),
        )
      } else {
        newScoreApproval.competencies = scoreApproval.competencies.map(
          c => (c.id === factor.id ? factor : c),
        )
      }
    })
    setData([newScoreApproval])
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
      updateCompetenciesAndIndicators(scoreApproval, data)
      nextQuestion(questionId)
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

  const nextQuestion = (questionId) => {
    const index = filteredQuestions.findIndex(q => q.id === questionId)
    const nextQuestionItem = filteredQuestions[index + 1]
    if (nextQuestionItem?.id) {
      setCurrentTab(nextQuestionItem.id)
    }
  }
  const status = scoreApproval.reviewAs === 'assessor' ? 'assessor_approved' : 'approver_approved'
  const { allowApprove } = scoreApproval

  const items = filteredQuestions.map((question, index) => {
    const approved = scoreApproval.indicators[question.id]
      .every(i => i.status === 'approver_approved' || i.status === status) && scoreApproval.competencies
      .filter(c => c.questionId === question.id && c.scoringType === 'generated').every(c => c.status === status)

    return ({
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
        overrideScore={overrideScore}
        discardScore={discardScore}
        approveQuestion={approveQuestion}
        nextQuestion={nextQuestion}
        allowApprove={allowApprove}
        approved={approved}
        lastQuestion={filteredQuestions.length === index + 1}
      />,
    })
  })
  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('administration.report_approval.dashboard'),
          },
          {
            label: () => I18n.t('administration.scoring_approval.score_approvals'),
            link: () => '/admin/ai_scoring_approvals',
          },
          {
            label: () => I18n.t('administration.scoring_approval.review'),
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
              {allowApprove && (
                <Button type="primary" onClick={approveAll}>
                  {I18n.t('admin.ai_scoring_appoval_approve_all_questions')}
                </Button>
              )}
            </Flex>
            <Card classNames={{ body: styles.headerCard }}>
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
          <Tabs
            className={styles.questionTabs}
            items={items}
            defaultActiveKey={items[0]?.key}
            activeKey={currentTab}
            onChange={setCurrentTab}
          />
        </Col>
      </Row>
    </>
  )
}
