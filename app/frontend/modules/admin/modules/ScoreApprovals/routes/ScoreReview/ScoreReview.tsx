import {
  Col, Row, Tabs, Flex, Button, Descriptions, Space,
} from 'antd'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import humps from 'humps'
import {
  ArrowLeftOutlined, InfoCircleOutlined, CheckCircleFilled,
} from '~/glint/icons/AccessibleIconsAntDesign'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { QuestionScore } from './QuestionScore'
import { useResources } from '~/hooks/useResources'
import { ScoreApproval, Indicator } from '../../core'

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

  if (!id || isLoading(`fetch@${id}`) || !scoreApproval) {
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


  const overrideScore = (scoreId, { score, reason, notApplicable }) => {
    memberAction({
      id,
      method: 'post',
      action: 'override_score',
      body: {
        factorScoreId: scoreId, score, reason, notApplicable,
      },
    }).then((data) => {
      updateCompetenciesAndIndicators(scoreApproval, data)
    })
  }

  const discardScore = (scoreId) => {
    memberAction({
      id,
      method: 'post',
      action: 'discard_score',
      body: {
        factorScoreId: scoreId,
      },
    }).then((data) => {
      updateCompetenciesAndIndicators(scoreApproval, data)
    })
  }

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
    })
  }

  const nextQuestion = (questionId) => {
    const index = filteredQuestions.findIndex(q => q.id === questionId)
    if (filteredQuestions[index + 1].id) {
      setCurrentTab(filteredQuestions[index + 1].id)
    }
  }

  const items = filteredQuestions.map((question, index) => {
    const status = scoreApproval.reviewAs === 'assessor' ? 'assessor_approved' : 'approver_approved'
    const approved = scoreApproval.indicators[question.id].every(i => i.status === status)
      && scoreApproval.competencies.filter(c => c.questionId === question.id)
        .every(c => c.status === status)

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
        <Col flex={1} style={{ padding: 16 }}>
          <Flex vertical gap={12}>
            <Flex justify="space-between">
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                {I18n.t('shared.back')}
              </Button>
              <Button type="primary">{I18n.t('admin.ai_scoring_appoval_approve_all_questions')}</Button>
            </Flex>
            <Descriptions
              column={2}
              size="small"
              style={{ width: '100%' }}
              bordered
              items={[]}
            />
          </Flex>
          <Tabs
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
