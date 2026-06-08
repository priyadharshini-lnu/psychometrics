import { Flex, Typography, Space } from 'antd'
import { RoundedCard } from './RoundedCard'

const { I18n } = window

const changeLabel = (property, defaultValue) => {
  if (!property) { return null }
  return `${(property[0]) || defaultValue} -> ${property[1]}`
}

const OverrideScore = ({
  meta, objectChanges, factor,
}) => (
  <Flex orientation="vertical">
    <Typography.Text>
      <Typography.Text strong>
        {meta.userName}
      </Typography.Text>
      {' '}
      {I18n.t('admin.change_score')}
      {': '}
      <Typography.Text strong>
        <Space>
          {changeLabel(objectChanges.overrideScore, factor.score)}
        </Space>
      </Typography.Text>
    </Typography.Text>
    {meta.reason && (
      <>
        <Typography.Text strong>
          {I18n.t('admin.change_reason')}
        </Typography.Text>
        <Typography.Text>
          {meta.reason}
        </Typography.Text>
      </>
    )}
  </Flex>
)

const DiscardScore = ({ meta }) => (
  <Flex orientation="vertical">
    <Typography.Text>
      <Typography.Text strong>
        {meta.userName}
      </Typography.Text>
      {' '}
      {I18n.t('admin.discarded_changes')}
    </Typography.Text>
  </Flex>
)

const Approve = () => 'approve'

const TYPES = {
  override_score: OverrideScore,
  discard_score: DiscardScore,
  discard_question: DiscardScore,
  approved: Approve,
}


export const ChangeLog = ({ logs, factor }) => {
  if (logs.length === 0) return null

  return (
    <Flex orientation="vertical" gap={8} style={{ marginTop: 16 }}>
      <Typography.Text>{I18n.t('admin.change_score_log')}</Typography.Text>
      <Flex orientation="vertical" gap={8}>
        {logs.map((log) => {
          const Log = TYPES[log.meta.changeEvent]

          return (
            <RoundedCard styles={{ background: 'var(--light-green-bg)' }}>
              <Log {...log} factor={factor} />
            </RoundedCard>
          )
        })}
      </Flex>
    </Flex>
  )
}
