import { useState } from 'react'
import {
  Divider, Flex, Typography, Collapse, Button,
  Popover, Space, Popconfirm,
} from 'antd'
import _ from 'lodash'
import cs from 'classnames'
import { SafeHTML } from '~/components/SafeHTML'
import styles from './ScoreReview.less'
import { EditScore } from './components/EditScore'
import { RoundedCard } from './components/RoundedCard'
import { VideoPreview } from './components/VideoPreview'
import { TextPreview } from './components/TextPreview'
import { AudioPreview } from './components/AudioPreview'
import { AIEditorIcon } from '~/glint/icons/AIEditorIcon'
import { EditOutlined, UserOutlined, ReloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ChangeLog } from './components/ChangeLog'

const { I18n } = window

const QuestionTypes = {
  VideoResponse: VideoPreview,
  TextEntry: TextPreview,
  AudioResponse: AudioPreview,
}

const CollapseHeader = ({
  factor, overrideScore, discardScore, approved, allowApprove,
}) => {
  const [open, setOpen] = useState(false)
  const overrided = !!factor.overrideScore

  const updateScore = (payload) => {
    overrideScore(factor.id, payload).then(() => {
      setOpen(false)
    })
  }

  const removeScore = () => {
    discardScore(factor.id)
  }

  return (
    <Flex align="center">
      <Flex vertical flex={1}>
        <Typography.Text>
          {factor.name}
        </Typography.Text>
      </Flex>
      <Flex onClick={e => e.stopPropagation()}>
        <Space>
          <Space>
            <Space className={overrided ? styles.opacity50 : undefined}>
              <AIEditorIcon style={{ color: 'var(--ant-primary-color)' }} />
              <span className={styles.score}>{factor.score.toFixed(2)}</span>
            </Space>
            {overrided && (
              <>
                <Divider orientation="vertical" size="large" style={{ borderColor: '#aaa' }} />
                <UserOutlined style={{ fontSize: 18, color: 'var(--ant-primary-color)' }} />
                <Typography.Text>
                  {I18n.t('admin.score')}
                  :
                </Typography.Text>
                <span className={styles.score}>
                  {factor.notApplicable ? I18n.t('shared.na_text') : factor.overrideScore.toFixed(2)}
                </span>
              </>
            )}
          </Space>
          {overrided && !approved && allowApprove && (
            <Popconfirm
              trigger="click"
              placement="bottomRight"
              title={I18n.t('admin.ai_scoring_appoval_reset_score')}
              description={I18n.t('admin.ai_scoring_appoval_reset_score_description')}
              onConfirm={removeScore}
            >
              <Button type="text" icon={<ReloadOutlined />} />
            </Popconfirm>
          )}
          {!approved && allowApprove && (
            <Popover
              trigger="click"
              placement="bottomRight"
              destroyOnHidden
              open={open}
              content={(
                <EditScore
                  value={factor.overrideScore || factor.score}
                  notApplicable={factor.notApplicable}
                  onSubmit={updateScore}
                  onClose={() => setOpen(false)}
                />
            )}
              onOpenChange={s => setOpen(s)}
            >
              <Button type="text" icon={<EditOutlined />} />
            </Popover>
          )}
        </Space>

      </Flex>
    </Flex>
  )
}

const CollapseContent = ({ factor }) => (
  <Flex vertical gap={8}>
    <Typography.Text type="secondary">{I18n.t('admin.ai_scoring_appoval_rational')}</Typography.Text>
    <Typography.Text>
      {factor.rationale}
    </Typography.Text>

    <Typography.Text type="secondary">{I18n.t('admin.ai_scoring_appoval_evidence_from_transcript')}</Typography.Text>
    {factor.citations.map((evidence, i) => (
      <RoundedCard key={i} styles={{ background: '#f5f5f5' }}>
        {evidence}
      </RoundedCard>
    ))}
    <ChangeLog logs={factor.changeLog} factor={factor} />
  </Flex>
)

export const CompetencyRow = ({
  competency, indicators, overrideScore, discardScore, approved, allowApprove,
}) => {
  const [open, setOpen] = useState(false)
  const hasIndicators = indicators?.length > 0
  const overridenScore = !hasIndicators && (competency.overrideScore || competency.notApplicable)

  const updateScore = (payload) => {
    overrideScore(competency.id, payload).then(() => {
      setOpen(false)
    })
  }

  const removeScore = () => {
    discardScore(competency.id)
  }

  return (
    <Flex vertical>
      <Flex vertical gap={8}>
        <Flex vertical style={{ marginBottom: 16 }} gap={8}>
          <Flex flex={1} justify="space-between">
            <Flex orientation="vertical" gap={4}>
              <Typography.Title level={4}>{competency.name}</Typography.Title>
              <Typography.Text>{competency.description}</Typography.Text>
            </Flex>
            <Space>
              <div className={cs(styles.overralScore, { [styles.opacity50]: overridenScore })}>
                <Space>
                  <AIEditorIcon style={{ color: 'var(--ant-primary-color)' }} />
                  {hasIndicators ? I18n.t('admin.overall_score') : I18n.t('admin.score')}
                </Space>
                <span className={styles.score}>{competency.score.toFixed(2)}</span>
              </div>
              {!hasIndicators && (
                <>
                  {overridenScore && (
                    <>
                      <div className={styles.overralScore}>
                        <Space>
                          <UserOutlined style={{ color: 'var(--ant-primary-color)' }} />
                          {I18n.t('admin.score')}
                        </Space>
                        <span className={styles.score}>
                          {competency.notApplicable ? I18n.t('shared.na_text') : competency.overrideScore.toFixed(2)}
                        </span>
                      </div>
                      {!approved && allowApprove && (
                        <Popconfirm
                          trigger="click"
                          placement="bottomRight"
                          title={I18n.t('admin.ai_scoring_appoval_reset_score')}
                          description={I18n.t('admin.ai_scoring_appoval_reset_score_description')}
                          onConfirm={removeScore}
                        >
                          <Button type="text" icon={<ReloadOutlined />} />
                        </Popconfirm>
                      )}
                    </>
                  )}
                  {!approved && allowApprove && (
                    <Popover
                      trigger="click"
                      placement="bottomRight"
                      destroyOnHidden
                      open={open}
                      content={(
                        <EditScore
                          value={competency.overrideScore || competency.score}
                          notApplicable={competency.notApplicable}
                          onSubmit={updateScore}
                          onClose={() => setOpen(false)}
                        />
                      )}
                      onOpenChange={s => setOpen(s)}
                    >
                      <Button type="text" icon={<EditOutlined />} onClick={e => e.stopPropagation()} />
                    </Popover>
                  )}
                </>
              )}
            </Space>
          </Flex>

        </Flex>
        {hasIndicators ? (
          <Flex vertical gap={8}>
            {indicators.map(factor => (
              <Collapse
                key={factor.id}
                style={{ borderRadius: 8 }}
                styles={{
                  root: {
                    background: '#fff',
                  },
                  header: {
                    alignItems: 'center',
                  },
                }}
                items={[{
                  key: '1',
                  label: <CollapseHeader
                    factor={factor}
                    overrideScore={overrideScore}
                    discardScore={discardScore}
                    approved={approved}
                    allowApprove={allowApprove}
                  />,
                  children: (
                    <CollapseContent factor={factor} />
                  ),
                }]}
              />
            ))}
          </Flex>
        ) : (
          <RoundedCard>
            <Flex vertical gap={8}>
              <Typography.Text type="secondary">
                {I18n.t('admin.ai_scoring_appoval_rational')}
              </Typography.Text>
              <Typography.Text>
                {competency.rationale}
              </Typography.Text>

              <Typography.Text type="secondary">
                {I18n.t('admin.ai_scoring_appoval_evidence_from_transcript')}
              </Typography.Text>
              {competency.citations.map((evidence, i) => (
                <RoundedCard key={i} styles={{ background: '#f8f8f8' }}>
                  <SafeHTML html={evidence} />
                </RoundedCard>
              ))}
              <ChangeLog logs={competency.changeLog} factor={competency} />
            </Flex>
          </RoundedCard>
        )}
      </Flex>
    </Flex>
  )
}

export const QuestionScore = ({
  question, competencies, indicators, result, mediaResponse, overrideScore, approveQuestion, discardScore,
  nextQuestion, lastQuestion, approved, allowApprove,
}) => {
  const QuestionPreview = QuestionTypes[question.type]

  const getCompetency = factorId => competencies.find(c => c.factorId.toString() === factorId)

  const groupedIndicators = _.groupBy(indicators, 'parentFactorId')

  const questionCompetencis = competencies.filter(c => c.questionId === question.id)

  return (
    <Flex vertical gap={24}>
      <Flex vertical gap={8}>
        <Typography.Title level={4}>{question.name}</Typography.Title>
        <SafeHTML html={question.props?.questionText} />
        <QuestionPreview question={question} mediaResponse={mediaResponse?.[0]} result={result} />
      </Flex>

      <Space orientation="vertical" separator={<Divider />}>
        <Typography.Title level={4}>
          <Space size="middle">
            <AIEditorIcon style={{ color: 'var(--ant-primary-color)', fontSize: 22 }} />
            {I18n.t('admin.ai_scoring_appoval_responses')}
          </Space>
        </Typography.Title>
        {_.map(groupedIndicators, (indicators, competencyFactorId) => {
          const competency = getCompetency(competencyFactorId)
          return (
            <CompetencyRow
              competency={competency}
              indicators={indicators}
              overrideScore={overrideScore}
              discardScore={discardScore}
              approved={approved}
              allowApprove={allowApprove}
            />
          )
        })}
        {questionCompetencis.map(competency => (
          <CompetencyRow
            competency={competency}
            indicators={[]}
            overrideScore={overrideScore}
            discardScore={discardScore}
            approved={approved}
            allowApprove={allowApprove}
          />
        ))}
      </Space>
      <Flex justify="flex-end" gap={12}>
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
