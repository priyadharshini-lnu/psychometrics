import {
  Card, Flex, Space, Tag, Typography,
} from 'antd'
import cs from 'classnames'
import styles from '../ScoreReview.less'
import {
  CaretRightOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, PauseOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import type { Citation } from '../../../core'
import { formatTimestamp } from '../utils'

const { I18n } = window

export const Evidence = ({ citation, onSeek, isPlaying = false }: {
  citation: Citation
  onSeek?: (seconds: number) => void
  isPlaying?: boolean
}) => {
  const hasTimestamp = citation.startTime != null && citation.endTime != null

  const getSentimentStyle = () => {
    if (citation.sentiment === 'positive') return styles.positive
    if (citation.sentiment === 'negative') return styles.negative
    return undefined
  }

  const PlayIcon = isPlaying ? PauseOutlined : CaretRightOutlined

  return (
    <Card
      classNames={{ body: cs(styles.evidance, getSentimentStyle()) }}
      styles={{ root: { borderRadius: 8 } }}
    >
      <Flex vertical gap={8}>
        <Flex align="center">
          {hasTimestamp && (
            <Space>
              <Typography.Text type="secondary"><ClockCircleOutlined /></Typography.Text>
              <Typography.Text>
                {formatTimestamp(citation.startTime!)}
              </Typography.Text>
            </Space>
          )}
          {citation.sentiment === 'positive' && (
            <Tag
              variant="outlined"
              color="success"
              icon={<CheckCircleOutlined />}
              style={{ marginLeft: 'auto' }}
            >
              {I18n.t('shared.positive')}
            </Tag>
          )}
          {citation.sentiment === 'negative' && (
            <Tag
              variant="outlined"
              color="error"
              icon={<CloseCircleOutlined />}
              style={{ marginLeft: 'auto' }}
            >
              {I18n.t('shared.negative')}
            </Tag>
          )}
        </Flex>
        <Flex align="flex-start" gap={8} className={styles.evidenceContent}>
          {onSeek && hasTimestamp && (
            <PlayIcon
              className={styles.playButton}
              onClick={() => onSeek(citation.startTime!)}
            />
          )}
          <Typography.Text>
            {citation.text}
          </Typography.Text>
        </Flex>
      </Flex>
    </Card>
  )
}
