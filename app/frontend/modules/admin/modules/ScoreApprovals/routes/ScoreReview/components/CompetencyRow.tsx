import { useState } from 'react'
import {
  Flex, Typography, Collapse, Button,
  Popover, Space, Popconfirm,
  Divider,
} from 'antd'
import cs from 'classnames'
import styles from '../ScoreReview.less'
import { EditScore } from './EditScore'
import { IndicatorRow } from './IndicatorRow'
import { AIEditorIcon } from '~/glint/icons/AIEditorIcon'
import { UserOutlined, ReloadOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ChangeLog } from './ChangeLog'
import { Evidence } from './Evidence'

const { I18n } = window

const CompetencyHeader = ({
  competency, hasIndicators, aggregatedScore, overridenScore,
  approved, allowApprove, updateScore, removeScore, open, setOpen,
}) => (
  <Flex align="center" justify="space-between" gap={8}>
    <Flex flex={1} style={{ minWidth: 0 }}>
      <Typography.Title level={5} ellipsis={{ tooltip: { title: competency.name } }}>
        {competency.name}
      </Typography.Title>
    </Flex>
    <Flex onClick={e => e.stopPropagation()}>
      <Flex align="center">
        {hasIndicators ? (
          <div className={styles.overallScore}>
            <Space>
              {`${I18n.t('admin.overall')}:`}
            </Space>
            <span className={styles.score}>{competency.score.toFixed(2)}</span>
          </div>
        ) : (
          <>
            <div className={cs(styles.overallScore, { [styles.opacity50]: overridenScore })}>
              <Space>
                <AIEditorIcon style={{ color: 'var(--ant-primary-color)' }} />
              </Space>
              <span className={styles.score}>{competency.score.toFixed(2)}</span>
            </div>
            {overridenScore && (
              <>
                <Divider orientation="vertical" />
                <div className={styles.overallScore}>
                  <Space>
                    <UserOutlined style={{ color: 'var(--ant-primary-color)' }} />
                    {`${I18n.t('admin.score')}:`}
                  </Space>
                  <span className={styles.score}>
                    {competency.notApplicable ? I18n.t('shared.na_text') : competency.overrideScore.toFixed(2)}
                  </span>
                </div>
                {!approved && allowApprove && (
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
                    value={competency.overrideScore ?? competency.score}
                    notApplicable={competency.notApplicable}
                    onSubmit={updateScore}
                    onClose={() => setOpen(false)}
                  />
                )}
                onOpenChange={s => setOpen(s)}
              >
                <Button type="text" icon={<EditOutlined />} />
              </Popover>
            )}
            {aggregatedScore && (
              <>
                <Divider orientation="vertical" />
                <div className={styles.overallScore}>
                  <Space>
                    {`${I18n.t('admin.overall')}:`}
                  </Space>
                  <span className={styles.score}>{aggregatedScore.score.toFixed(2)}</span>
                </div>
              </>
            )}
          </>
        )}
      </Flex>
    </Flex>
  </Flex>
)

const CompetencyContent = ({
  competency, hasIndicators, indicators, overrideScore, discardScore, approved, allowApprove,
  onSeek, playingCitationKey,
}) => (
  <Flex vertical gap={8}>
    <Flex style={{ padding: 16 }}>
      <Typography.Text type="secondary" style={{ fontSize: '0.9em' }}>{competency.description}</Typography.Text>
    </Flex>
    {hasIndicators ? (
      <Flex vertical gap={8}>
        {indicators.map(factor => (
          <IndicatorRow
            key={factor.id}
            factor={factor}
            overrideScore={overrideScore}
            discardScore={discardScore}
            approved={approved}
            allowApprove={allowApprove}
            onSeek={onSeek}
            playingCitationKey={playingCitationKey}
          />
        ))}
      </Flex>
    ) : (
      <Flex vertical gap={8} style={{ padding: 16 }}>
        <Typography.Text strong>
          {I18n.t('admin.rationale')}
        </Typography.Text>
        <Typography.Text>
          {competency.rationale}
        </Typography.Text>

        <Typography.Text strong>
          {I18n.t('admin.evidence_from_transcript')}
        </Typography.Text>
        {competency.citations.map((citation, i) => (
          <Evidence
            key={i}
            citation={citation}
            onSeek={onSeek}
            isPlaying={playingCitationKey === `${citation.startTime}`}
          />
        ))}
        <ChangeLog logs={competency.changeLog} factor={competency} />
      </Flex>
    )}
  </Flex>
)

export const CompetencyRow = ({
  competency, indicators, overrideScore, discardScore, approved, allowApprove, aggregatedScore = null,
  isFirst = false, onSeek, playingCitationKey,
}) => {
  const [open, setOpen] = useState(false)
  const hasIndicators = indicators?.length > 0
  const overridenScore = !hasIndicators && (competency.overrideScore || competency.notApplicable)

  const updateScore = (payload) => {
    overrideScore(competency.id, payload)
    setOpen(false)
  }

  const removeScore = () => {
    discardScore(competency.id)
  }

  return (
    <Collapse
      defaultActiveKey={isFirst ? ['1'] : []}
      style={{ borderRadius: 6 }}
      styles={{
        root: {
          background: '#fff',
        },
        header: {
          alignItems: 'center',
          background: 'var(--ant-control-tmp-outline)',
          maxWidth: '100%',
          padding: 12,
        },
        title: {
          maxWidth: 'calc(100% - 24px)',
        },
        body: {
          padding: 0,
        },
      }}
      items={[{
        key: '1',
        label: (
          <CompetencyHeader
            competency={competency}
            hasIndicators={hasIndicators}
            aggregatedScore={aggregatedScore}
            overridenScore={overridenScore}
            approved={approved}
            allowApprove={allowApprove}
            updateScore={updateScore}
            removeScore={removeScore}
            open={open}
            setOpen={setOpen}
          />
        ),
        children: (
          <CompetencyContent
            competency={competency}
            hasIndicators={hasIndicators}
            indicators={indicators}
            overrideScore={overrideScore}
            discardScore={discardScore}
            approved={approved}
            allowApprove={allowApprove}
            onSeek={onSeek}
            playingCitationKey={playingCitationKey}
          />
        ),
      }]}
    />
  )
}
