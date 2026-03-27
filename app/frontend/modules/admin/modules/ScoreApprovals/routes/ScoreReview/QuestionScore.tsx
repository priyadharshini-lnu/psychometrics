import {
  Divider, Flex, Typography, Button, Space, Popconfirm,
} from 'antd'
import _ from 'lodash'
import { ReloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import styles from './ScoreReview.less'
import { VideoPreview } from './components/VideoPreview'
import { AudioPreview } from './components/AudioPreview'
import { CompetencyRow } from './components/CompetencyRow'
import { AIEditorIcon } from '~/glint/icons/AIEditorIcon'

const { I18n } = window

const QuestionTypes = {
  VideoResponse: VideoPreview,
  AudioResponse: AudioPreview,
}

export const QuestionScore = ({
  question, competencies, indicators, result, mediaResponse, overrideScore, approveQuestion, discardScore,
  nextQuestion, lastQuestion, approved, allowApprove, discardQuestion,
}) => {
  const QuestionPreview = QuestionTypes[question.type]

  const getCompetency = factorId => competencies.find(c => c.factorId.toString() === factorId)

  const getAggregatedScore = factorId => competencies.find(
    c => c.factorId === factorId && c.scoringType === 'aggregated',
  )

  const groupedIndicators = _.groupBy(indicators, 'parentFactorId')

  const questionCompetencis = competencies.filter(c => c.questionId === question.id)

  return (
    <Flex vertical gap={24}>
      <Flex vertical gap={8} align="center">
        <Flex vertical style={{ width: '100%' }}>
          <Typography.Title level={4}>{question.name}</Typography.Title>
          <SafeHTML html={question.props?.questionText} />
        </Flex>

        {QuestionPreview && (
          <QuestionPreview
            question={question}
            mediaResponse={mediaResponse?.[0]}
            result={result}
          />
        )}
      </Flex>

      <Typography.Title level={4}>
        <Space size="middle">
          <AIEditorIcon style={{ color: 'var(--ant-primary-color)', fontSize: 22 }} />
          {I18n.t('admin.ai_scoring_appoval_responses')}
        </Space>
        <Divider size="small" />
      </Typography.Title>
      <Flex gap={24} align="flex-start">
        <Flex vertical flex={1} gap={16} style={{ maxWidth: '50%' }}>
          <Space orientation="vertical" style={{ width: '100%' }}>
            {Object.keys(groupedIndicators).map((competencyFactorId, index) => {
              const competency = getCompetency(competencyFactorId)
              const indicators = groupedIndicators[competencyFactorId]
              return (
                <CompetencyRow
                  key={competencyFactorId}
                  competency={competency}
                  indicators={indicators}
                  overrideScore={overrideScore}
                  discardScore={discardScore}
                  approved={approved}
                  allowApprove={allowApprove}
                  isFirst={index === 0}
                />
              )
            })}
            {questionCompetencis.map((competency, index) => (
              <CompetencyRow
                key={competency.id}
                competency={competency}
                indicators={[]}
                aggregatedScore={getAggregatedScore(competency.factorId)}
                overrideScore={overrideScore}
                discardScore={discardScore}
                approved={approved}
                allowApprove={allowApprove}
                isFirst={_.isEmpty(groupedIndicators) && index === 0}
              />
            ))}
          </Space>
        </Flex>

        <Flex vertical flex={1} gap={16} className={styles.stickyTranscription}>
          <div className={styles.transcriptionContainer}>
            {(question.type === 'VideoResponse' || question.type === 'AudioResponse') && (
              <>
                <Typography.Title level={5}>
                  {I18n.t('shared.transcription')}
                </Typography.Title>
                <div className={styles.transcriptionText}>
                  <SafeHTML html={
                    mediaResponse?.[0]?.transcriptionText
                    || I18n.t('admin.ai_score_approval_no_transcription')
                  }
                  />
                </div>
              </>
            )}
            {question.type === 'TextEntry' && (
              <>
                <Typography.Title level={5}>
                  {I18n.t('shared.response_text')}
                </Typography.Title>
                <div className={styles.transcriptionText}>
                  <SafeHTML html={
                    result?.answers?.[0]?.value
                    || I18n.t('admin.ai_score_approval_no_answer')
                  }
                  />
                </div>
              </>
            )}
          </div>
        </Flex>
      </Flex>

      <Flex justify="flex-end" gap={12}>
        {!approved && allowApprove && (
          <Popconfirm
            title={I18n.t('admin.ai_scoring_appoval_discard_question_confirm_title')}
            description={I18n.t('admin.ai_scoring_appoval_discard_question_confirm_description')}
            onConfirm={() => discardQuestion(question.id)}
            okText={I18n.t('shared.ok')}
            cancelText={I18n.t('shared.cancel')}
          >
            <Button icon={<ReloadOutlined />}>
              {I18n.t('admin.ai_scoring_appoval_discard_question')}
            </Button>
          </Popconfirm>
        )}
        {!approved && allowApprove && (
          <Button type="primary" onClick={() => approveQuestion(question.id)}>
            {I18n.t('admin.ai_scoring_appoval_approve_question')}
          </Button>
        )}
        {!lastQuestion && (
          <Button onClick={() => nextQuestion(question.id)}>
            {I18n.t('admin.ai_scoring_appoval_next')}
          </Button>
        )}
      </Flex>
    </Flex>
  )
}
