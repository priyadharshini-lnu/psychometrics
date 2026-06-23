import {
  Flex, Typography, Button, Space, Popconfirm,
} from 'antd'
import _ from 'lodash'
import {
  useCallback, useEffect, useRef, useState,
} from 'react'
import { ReloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import styles from './ScoreReview.less'
import { VideoPreview } from './components/VideoPreview'
import { AudioPreview } from './components/AudioPreview'
import { CompetencyRow } from './components/CompetencyRow'
import { AIEditorIcon } from '~/glint/icons/AIEditorIcon'
import type { HighlightAnchor, TranscriptionSegment } from '../../core'
import {
  formatTimestamp,
  renderHighlightedText,
} from './utils'

const { I18n } = window

interface MediaPlayerLike {
  currentTime: ((seconds: number) => void) | number
  play: () => Promise<void> | void
  pause: () => void
  on: (event: string, handler: EventListener) => void
  off: (event: string, handler: EventListener) => void
}

interface PlayerRefHandle {
  player: MediaPlayerLike | null
}

const QuestionTypes = {
  VideoResponse: VideoPreview,
  AudioResponse: AudioPreview,
}

const TranscriptSegments = ({ segments, anchors }: {
  segments: TranscriptionSegment[]
  anchors: HighlightAnchor[]
}) => (
  <Flex vertical gap={2}>
    {segments.map((segment, i) => {
      const segmentAnchors = anchors.filter(a => a.segmentIndex === i)
      return (
        <div key={i} className={styles.transcriptSegment}>
          <Typography.Text
            type="secondary"
            className={styles.segmentTimestamp}
          >
            {`[${formatTimestamp(segment.startTime)} - ${formatTimestamp(segment.endTime)}]`}
          </Typography.Text>
          <Typography.Text>
            {renderHighlightedText(segment.text, segmentAnchors)}
          </Typography.Text>
        </div>
      )
    })}
  </Flex>
)

export const QuestionScore = ({
  question, competencies, indicators, result, mediaResponse, overrideScore, approveQuestion, discardScore,
  nextQuestion, lastQuestion, approved, allowApprove, discardQuestion, highlightAnchors,
}) => {
  const playerRef = useRef<PlayerRefHandle | null>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const [playingCitationKey, setPlayingCitationKey] = useState<string | null>(null)
  const QuestionPreview = QuestionTypes[question.type]

  const getCompetency = factorId => competencies.find(c => c.factorId.toString() === factorId)

  const getAggregatedScore = factorId => competencies.find(
    c => c.factorId === factorId && c.scoringType === 'aggregated',
  )

  const groupedIndicators = _.groupBy(indicators, 'parentFactorId')

  const questionCompetencis = competencies.filter(c => c.questionId === question.id)

  const isMediaQuestion = question.type === 'VideoResponse' || question.type === 'AudioResponse'
  const segments: TranscriptionSegment[] = mediaResponse?.[0]?.transcriptionSegments || []
  const hasSegments = segments.length > 0
  const anchors: HighlightAnchor[] = highlightAnchors || []

  const seekTo = useCallback((seconds: number) => {
    const player = playerRef.current?.player
    if (!player) return

    const citationKey = `${seconds}`
    if (playingCitationKey === citationKey) {
      player.pause()
      setPlayingCitationKey(null)
    } else {
      videoContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (typeof player.currentTime === 'function') {
        player.currentTime(seconds)
      } else {
        player.currentTime = seconds
      }
      player.play()
      setPlayingCitationKey(citationKey)
    }
  }, [playingCitationKey])

  useEffect(() => {
    const player = playerRef.current?.player
    if (!player) return undefined

    const onPause = () => setPlayingCitationKey(null)
    const onEnded = () => setPlayingCitationKey(null)

    player.on('pause', onPause)
    player.on('ended', onEnded)

    return () => {
      player.off('pause', onPause)
      player.off('ended', onEnded)
    }
  }, [playerRef.current?.player])

  const onSeek = isMediaQuestion ? seekTo : undefined

  return (
    <Flex vertical gap={24}>
      <Flex vertical gap={8} align="center">
        <Flex vertical style={{ width: '100%' }}>
          <Typography.Title level={4}>{question.name}</Typography.Title>
          <SafeHTML html={question.props?.questionText} />
        </Flex>

        {QuestionPreview && (
          <div ref={videoContainerRef}>
            <QuestionPreview
              question={question}
              mediaResponse={mediaResponse?.[0]}
              result={result}
              playerRef={playerRef}
            />
          </div>
        )}
      </Flex>

      <Typography.Title level={4}>
        <Space size="middle">
          <AIEditorIcon style={{ color: 'var(--ant-primary-color)', fontSize: 22 }} />
          {I18n.t('admin.responses')}
        </Space>
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
                  onSeek={onSeek}
                  playingCitationKey={playingCitationKey}
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
                onSeek={onSeek}
                playingCitationKey={playingCitationKey}
              />
            ))}
          </Space>
        </Flex>

        <Flex vertical flex={1} gap={16} className={styles.stickyTranscription}>
          <div className={styles.transcriptionContainer}>
            {isMediaQuestion && (
              <>
                <Typography.Title level={5}>
                  {I18n.t('shared.transcription')}
                </Typography.Title>
                <div className={styles.transcriptionText}>
                  {hasSegments ? (
                    <TranscriptSegments
                      segments={segments}
                      anchors={anchors}
                    />
                  ) : (
                    <SafeHTML html={
                      mediaResponse?.[0]?.transcriptionText
                      || I18n.t('admin.ai_score_approval_no_transcription')
                    }
                    />
                  )}
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
            title={I18n.t('admin.discard_question_confirm_title')}
            description={I18n.t('admin.discard_question_confirm_description')}
            onConfirm={() => discardQuestion(question.id)}
            okText={I18n.t('shared.ok')}
            cancelText={I18n.t('shared.cancel')}
          >
            <Button icon={<ReloadOutlined />}>
              {I18n.t('admin.discard_question')}
            </Button>
          </Popconfirm>
        )}
        {!approved && allowApprove && (
          <Button type="primary" onClick={() => approveQuestion(question.id)}>
            {I18n.t('admin.approve_question')}
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
