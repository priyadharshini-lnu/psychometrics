import { useState } from 'react'
import {
  Divider, Flex, Typography, Collapse, Button,
  Popover, Space, Popconfirm,
} from 'antd'
import styles from '../ScoreReview.less'
import { EditScore } from './EditScore'
import { AIEditorIcon } from '~/glint/icons/AIEditorIcon'
import { EditOutlined, UserOutlined, ReloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ChangeLog } from './ChangeLog'
import { Evidence } from './Evidence'

const { I18n } = window

const IndicatorHeader = ({
  factor, overrideScore, discardScore, approved, allowApprove,
}) => {
  const [open, setOpen] = useState(false)
  const overrided = !!factor.overrideScore

  const updateScore = (payload) => {
    overrideScore(factor.id, payload)
    setOpen(false)
  }

  const removeScore = () => {
    discardScore(factor.id)
  }

  return (
    <Flex align="center" justify="space-between" gap={8}>
      <Flex flex={1} style={{ minWidth: 0 }}>
        <Typography.Title level={5} ellipsis={{ tooltip: { title: factor.name } }}>
          {factor.name}
        </Typography.Title>
      </Flex>
      <Flex onClick={e => e.stopPropagation()}>
        <Flex align="center">
          <Flex align="center">
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
          </Flex>
          {overrided && !approved && allowApprove && (
            <Popconfirm
              trigger="click"
              placement="bottomRight"
              title={I18n.t('admin.reset_score')}
              description={I18n.t('admin.reset_score_description')}
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
                  value={factor.overrideScore ?? factor.score}
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
        </Flex>
      </Flex>
    </Flex>
  )
}

const IndicatorContent = ({ factor, onSeek, playingCitationKey }) => (
  <Flex vertical gap={8}>
    <Typography.Text strong>{I18n.t('admin.rationale')}</Typography.Text>
    <Typography.Text>
      {factor.rationale}
    </Typography.Text>

    <Typography.Text strong>{I18n.t('admin.evidence_from_transcript')}</Typography.Text>
    {factor.citations.map((citation, i) => (
      <Evidence
        key={i}
        citation={citation}
        onSeek={onSeek}
        isPlaying={playingCitationKey === `${citation.startTime}`}
      />
    ))}
    <ChangeLog logs={factor.changeLog} factor={factor} />
  </Flex>
)

export const IndicatorRow = ({
  factor, overrideScore, discardScore, approved, allowApprove,
  onSeek, playingCitationKey,
}) => {
  const [activeKey, setActiveKey] = useState<string[]>([])
  const isOpen = activeKey.length > 0

  return (
    <Collapse
      activeKey={activeKey}
      onChange={setActiveKey}
      className={styles.indicatorCollapse}
      style={{
        borderRadius: 0,
        borderLeft: isOpen ? '4px solid var(--ant-primary-color)' : 'none',
      }}
      styles={{
        root: {
          background: '#fff',
          borderRadius: 0,
        },
        header: {
          alignItems: 'center',
          borderRadius: 0,
          padding: 12,
        },
        title: {
          maxWidth: 'calc(100% - 24px)',
        },
      }}
      items={[{
        key: '1',
        label: (
          <IndicatorHeader
            factor={factor}
            overrideScore={overrideScore}
            discardScore={discardScore}
            approved={approved}
            allowApprove={allowApprove}
          />
        ),
        children: (
          <IndicatorContent factor={factor} onSeek={onSeek} playingCitationKey={playingCitationKey} />
        ),
      }]}
    />
  )
}
