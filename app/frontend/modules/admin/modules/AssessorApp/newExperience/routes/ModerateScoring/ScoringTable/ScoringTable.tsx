import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react'
import {
  Table, Flex, Button, Typography, InputNumber, Skeleton, Modal, Tooltip, Switch, useApp,
} from '@thetalententerprise/glint'
import { useParams } from 'react-router-dom'
import * as t from 'io-ts'
import type { ColumnsType } from 'antd/es/table'
import { InfoCircleOutlined, StopOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE } from '~/modules/admin/constants/campaignFactors'
import {
  Score, ScoreTR, CampaignFactorValue, CampaignFactorValueTR, Weightage,
} from '~/modules/admin/modules/campaigns/core/combinedScoring'
import { median } from '~/utils/array'
import { EMPTY_SCORE_INDICATOR } from '~/modules/admin/constants/string'
import { useResources } from '~/hooks/useResources'
import type { BaseMeta } from '~/hooks/useResources/interfaces'
import { Weightages } from '~/modules/admin/modules/AssessorApp/routes/ModerateScoring/ScoringTable/Weightages'
import {
  calculateAverageScores,
} from '~/modules/admin/modules/AssessorApp/routes/ModerateScoring/ScoringTable/commands/calculateAverageScores'
import {
  calculateHighLowScores,
} from '~/modules/admin/modules/AssessorApp/routes/ModerateScoring/ScoringTable/commands/calculateHighLowScores'
import {
  calculateWeightedAverageScores,
} from '~/modules/admin/modules/AssessorApp/routes/ModerateScoring/ScoringTable/commands/calculateWeightedAverageScores'
import { useMessageBus } from '~/hooks/useMessageBus'
import {
  GroupedFactor, GroupedFactorTR, FactorGroup, FactorGroupTR, ScoringRow, AssessmentColumnGroup,
  buildAssessors, buildAssessmentGroups, buildScoresLookup, buildScoringRows, collectGroupKeys,
} from '../core/groupedScoring'
import { AssessmentGroupFilter } from './AssessmentGroupFilter'
import { AssessorAvatar, AssessorLegend } from './AssessorLegend'
import styles from './ScoringTable.less'

const { I18n } = window
interface ScoringTableProps {
  onSave: () => void
  readOnly: boolean
}

interface ScoresMeta extends BaseMeta {
  campaignScoresFinalized?: boolean
}

const getScoreStatus = (
  value: number | string | null | undefined,
  factor: GroupedFactor,
): '' | 'error' => {
  if (value === null || value === undefined || value === '') return ''
  const numericValue = typeof value === 'number' ? value : Number(value)
  const { minValue, maxValue } = factor
  if ((minValue !== null && numericValue < minValue) || (maxValue !== null && numericValue > maxValue)) {
    return 'error'
  }
  return ''
}

const renderScoreByMedian = (score: number, factorMedian: number): React.ReactNode => {
  const medianDistance = Math.abs((factorMedian / score) - 1)
  if (medianDistance > 0.25 && medianDistance < 0.75) {
    return <Typography.Text className="font-bold" type="warning">{score}</Typography.Text>
  }
  if (medianDistance >= 0.75) {
    return <Typography.Text className="font-bold" type="danger">{score}</Typography.Text>
  }
  return <Typography.Text className="font-bold">{score}</Typography.Text>
}

const renderEmptyIndicator = (): React.ReactNode => (
  <Tooltip title={I18n.t('shared.na_text')}>
    <span><StopOutlined style={{ color: 'var(--grey-text)' }} /></span>
  </Tooltip>
)

const SCORING_TABLE_SCROLL_Y = 'calc(100vh - 360px)'

const ScoringTable: React.FC<ScoringTableProps> = ({ onSave, readOnly }) => {
  const { campaignId, userId } = useParams() as { campaignId: string, userId: string }
  const { message } = useApp()

  const {
    data: columnsData, fetch: fetchFactors, isLoading: isFactorsLoading,
  } = useResources<GroupedFactor>(
    'campaign_factors',
    {
      trackUrl: true,
      responseType: GroupedFactorTR,
      basePath: `campaigns/${campaignId}`,
      apiConfig: {
        filter: { factor_type_eq: 'assessor_scoring' },
        page: { size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE },
      },
    },
  )

  const {
    data: factorGroups, fetch: fetchFactorGroups, isLoading: isFactorGroupsLoading,
  } = useResources<FactorGroup>(
    'campaign_factor_groups',
    {
      responseType: FactorGroupTR,
      basePath: `campaigns/${campaignId}`,
      apiConfig: {
        include: ['campaign_factors'],
        fields: { campaign_factor_groups: ['name', 'position'] },
        page: { size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE },
      },
    },
  )

  const {
    data: evaluatorsData, meta: scoresMeta, fetch: fetchScores, isLoading: isScoresLoading,
  } = useResources<Score, ScoresMeta>(
    'assessors_scores',
    {
      trackUrl: true,
      responseType: ScoreTR,
      basePath: `campaigns/${campaignId}/users/${userId}`,
    },
  )

  const scoresFinalized = scoresMeta?.campaignScoresFinalized || false

  const {
    data: finalScoreData, fetch: fetchFinalScore, isLoading: isFinalScoreLoading,
    collectionAction: updateFinalScore,
  } = useResources<CampaignFactorValue>(
    'campaign_factor_values',
    {
      trackUrl: true,
      responseType: CampaignFactorValueTR,
      basePath: `campaigns/${campaignId}`,
      apiConfig: {
        filter: {
          user_id_eq: userId,
          campaign_factor_factor_type_eq: 'assessor_scoring',
        },
        page: { size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE },
      },
    },
  )

  const {
    data: factorWeightagesData, fetch: fetchFactorWeightages, isLoading: isWeightageLoading,
  } = useResources<Weightage>('campaign_assessor_assessment_factor_weights', {
    basePath: `campaigns/${campaignId}`,
    apiConfig: { page: { size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE } },
  })

  const [disabled, setDisabled] = useState<boolean>(true)
  const [disabledSave, setDisabledSave] = useState<boolean>(false)
  const [enabledNAFactors, setEnabledNAFactors] = useState<Record<string, boolean>>({})
  const [finalScores, setFinalScores] = useState<Record<string, number | string | null>>({})
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([])
  const [visibleAssessmentGroups, setVisibleAssessmentGroups] = useState<AssessmentColumnGroup[]>([])
  const [open, setOpen] = useState(false)

  useMessageBus('lead_assessor_assessment:status_change', (status) => {
    setDisabled(status === 'completed')
  })

  const averageScores = useMemo(() => calculateAverageScores(columnsData, evaluatorsData),
    [columnsData, evaluatorsData])
  const highLowScores = useMemo(() => calculateHighLowScores(columnsData, evaluatorsData),
    [columnsData, evaluatorsData])
  const weightedAverageScores = useMemo(() => calculateWeightedAverageScores(
    columnsData, evaluatorsData, factorWeightagesData,
  ), [columnsData, evaluatorsData, factorWeightagesData])

  const medians = useMemo(() => columnsData.reduce((acc, factor) => {
    const factorValues = evaluatorsData
      .map(e => e.scores[factor.factorId])
      .filter((v): v is number => v !== null && v !== undefined)
    acc[factor.factorId] = median(factorValues)
    return acc
  }, {} as Record<string, number>), [columnsData, evaluatorsData])

  const assessors = useMemo(() => buildAssessors(evaluatorsData), [evaluatorsData])
  const assessmentGroups = useMemo(() => buildAssessmentGroups(evaluatorsData), [evaluatorsData])
  const scoresLookup = useMemo(() => buildScoresLookup(evaluatorsData), [evaluatorsData])
  const rows = useMemo(() => buildScoringRows(factorGroups, columnsData), [factorGroups, columnsData])

  useEffect(() => {
    setExpandedRowKeys(collectGroupKeys(rows))
  }, [rows])

  useEffect(() => {
    setVisibleAssessmentGroups(assessmentGroups)
  }, [assessmentGroups])

  const factorIdToIdMap = useMemo(() => columnsData.reduce((acc, factor) => {
    acc[`factorId${factor.factorId}`] = factor.id
    acc[`CampaignFactorId${factor.id}`] = factor.factorId
    return acc
  }, {} as Record<string, string>), [columnsData])

  useEffect(() => {
    fetchScores()
    fetchFactors()
    fetchFactorGroups()
    fetchFinalScore()
    fetchFactorWeightages()
  }, [])

  const initializeFinalScores = useCallback(() => {
    const newFinalScores: Record<string, number | string | null> = {}
    const newFinalNAScores: Record<string, boolean> = {}
    if (finalScoreData && finalScoreData.length > 0 && factorIdToIdMap) {
      finalScoreData.forEach((scoreData) => {
        const factorId = factorIdToIdMap[`CampaignFactorId${scoreData.campaignFactorId}`]
        if (factorId) {
          newFinalScores[factorId] = scoreData.numericValue ?? scoreData.stringValue
          newFinalNAScores[factorId] = scoreData.numericValue === null && scoreData.stringValue === null
        }
      })
    } else if (weightedAverageScores && Object.keys(weightedAverageScores).length > 0) {
      Object.keys(weightedAverageScores).forEach((key) => {
        newFinalScores[key] = weightedAverageScores[key] === EMPTY_SCORE_INDICATOR ? null : weightedAverageScores[key]
      })
    } else {
      Object.keys(averageScores).forEach((key) => {
        newFinalScores[key] = averageScores[key] === EMPTY_SCORE_INDICATOR ? null : averageScores[key]
      })
    }
    setFinalScores(newFinalScores)
    setEnabledNAFactors(newFinalNAScores)
  }, [finalScoreData, weightedAverageScores, averageScores, factorIdToIdMap])

  useEffect(() => {
    initializeFinalScores()
  }, [initializeFinalScores])

  const handleFinalScoreChange = (factorId: string, value: number | string | null) => {
    setFinalScores(prev => ({ ...prev, [factorId]: value }))
  }

  const handleReset = () => {
    initializeFinalScores()
  }

  const handleSave = () => {
    if (readOnly) return

    const factorOutOfRange = Object.keys(finalScores).find((key) => {
      const factor = columnsData.find(f => f.factorId === key)
      if (!factor) return false

      const value = finalScores[key]
      const { minValue, maxValue } = factor

      if (enabledNAFactors[key] && value == null) return false

      if (minValue == null && maxValue == null && value == null) {
        message.error(I18n.t('admin.final_score_empty_err_msg', { factor_name: factor.name }))
        return true
      }

      const numericValue = Number(value)
      if ((minValue !== null && numericValue < minValue)
        || (maxValue !== null && numericValue > maxValue)
        || (value == null && !enabledNAFactors[key])) {
        message.error(I18n.t('admin.scoring_value_out_of_range_err_msg', {
          factor_name: factor.name,
          min: factor.minValue,
          max: factor.maxValue,
        }))
        return true
      }
      return false
    })

    if (factorOutOfRange) return

    setDisabledSave(true)
    const autoModeratedFactorIds = new Set(
      columnsData.filter(f => f.disallowLeadAssessorModeration).map(f => f.factorId),
    )
    const scores = Object.keys(finalScores)
      .filter(key => !autoModeratedFactorIds.has(key))
      .map(key => ({
        campaign_factor_id: factorIdToIdMap[`factorId${key}`],
        score: Number.isNaN(finalScores[key]) ? Number(finalScores[key]) : finalScores[key],
      }))

    updateFinalScore({
      action: 'save_assessor_scoring_factor_value',
      method: 'post',
      responseType: t.string,
      body: { scores, user_id: userId },
    }).then(() => {
      message.success(I18n.t('admin.scoring_final_score_updated_successfully'))
      if (onSave) {
        onSave()
        setDisabled(true)
      }
    }).catch((errors) => {
      const errorMessage = errors?.base?.[0]?.title || I18n.t('shared.something_wrong')
      message.error(errorMessage)
    }).finally(() => {
      setDisabledSave(false)
    })
  }

  useMessageBus('assessment:finished', () => handleSave())

  const renderFinalCell = (factor: GroupedFactor): React.ReactNode => {
    const scoreStatus = getScoreStatus(finalScores[factor.factorId], factor)
    const isOutOfRange = scoreStatus === 'error'

    return (
      <Flex align="center" gap={4}>
        {enabledNAFactors[factor.factorId]
          ? <Typography.Text>{I18n.t('shared.na_text')}</Typography.Text>
          : (
            <Flex vertical gap={2}>
              <InputNumber
                disabled={readOnly || scoresFinalized || factor.disallowLeadAssessorModeration}
                status={scoreStatus}
                value={finalScores[factor.factorId] as number | string | null}
                precision={2}
                onChange={value => handleFinalScoreChange(factor.factorId, value)}
              />
              {isOutOfRange && (
                <Typography.Text type="danger" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                  {I18n.t('admin.scoring_value_out_of_range_err_msg', {
                    factor_name: '',
                    min: factor.minValue,
                    max: factor.maxValue,
                  }).replace(/^[^:]+:\s*/, '')}
                </Typography.Text>
              )}
            </Flex>
          )}
        {(!readOnly && factor.minValue !== null && factor.maxValue !== null
          && !factor.disallowLeadAssessorModeration) && (
            <Tooltip title={I18n.t('admin.scoring_value_info', { min: factor.minValue, max: factor.maxValue })}>
              <Button icon={<InfoCircleOutlined />} type="text" size="small" />
            </Tooltip>
        )}
        {factor.disallowLeadAssessorModeration && (
          <Tooltip title={I18n.t('admin.auto_moderated_factor_info')}>
            <Button icon={<InfoCircleOutlined />} type="text" size="small" />
          </Tooltip>
        )}
        {factor.isNaAllowed && (
          <Switch
            onChange={(checked) => {
              setEnabledNAFactors(prev => ({ ...prev, [factor.factorId]: checked }))
              if (checked) handleFinalScoreChange(factor.factorId, null)
            }}
            checked={!!enabledNAFactors[factor.factorId]}
            checkedChildren={I18n.t('shared.na_text')}
            unCheckedChildren={I18n.t('shared.na_text')}
            disabled={readOnly || scoresFinalized || factor.disallowLeadAssessorModeration}
          />
        )}
      </Flex>
    )
  }
  const renderScoreCell = (factorId: string, assessmentId: string, evaluatorId: string): React.ReactNode => {
    const score = scoresLookup.get(assessmentId)?.get(evaluatorId)
    const value = score
      ? Object.entries(score.scores).find(([scoreFactorId]) => scoreFactorId === factorId)?.[1]
      : undefined
    if (value === undefined || value === null) return renderEmptyIndicator()
    return renderScoreByMedian(value, medians[factorId])
  }

  const columns: ColumnsType<ScoringRow> = [
    {
      title: I18n.t('admin.competency_indicator'),
      fixed: 'left',
      children: [
        {
          title: I18n.t('admin.assessors'),
          key: 'label',
          width: 280,
          fixed: 'left',
          render: (_value, record) => (record.isGroup
            ? <Typography.Text strong>{record.label}</Typography.Text>
            : (
              <Typography.Text>
                {record.label}
              </Typography.Text>
            )),
        },
      ],
    },
    ...visibleAssessmentGroups.map(group => ({
      title: <Tooltip title={group.name}>{group.name}</Tooltip>,
      key: group.id,
      children: [...group.evaluatorIds]
        .map(evaluatorId => assessors.find(assessor => assessor.id === evaluatorId))
        .filter(assessor => assessor !== undefined)
        .sort((a, b) => a.index - b.index)
        .map(assessor => ({
          title: <AssessorAvatar assessor={assessor} />,
          key: `${group.id}-${assessor.id}`,
          align: 'center' as const,
          width: 80,
          render: (_value, record: ScoringRow) => (
            record.isGroup || !record.factorId
              ? null
              : renderScoreCell(record.factorId, group.id, assessor.id)
          ),
        })),
    })),
    {
      title: I18n.t('admin.scoring_score_range'),
      key: 'scoreRange',
      fixed: 'right',
      align: 'center',
      width: 110,
      className: styles.scoreRangeColumn,
      onHeaderCell: () => ({ className: styles.scoreRangeHeader }),
      render: (_value, record) => {
        if (record.isGroup || !record.factorId) return null
        const range = highLowScores[record.factorId]
        return range ? `${range.low} - ${range.high}` : renderEmptyIndicator()
      },
    },
    {
      title: factorWeightagesData.length > 0
        ? I18n.t('admin.scoring_actual_average')
        : I18n.t('admin.scoring_average'),
      key: 'average',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (_value, record) => {
        if (record.isGroup || !record.factorId) return null
        const averageScore = averageScores[record.factorId]
        if (averageScore === EMPTY_SCORE_INDICATOR || averageScore == null) {
          return renderEmptyIndicator()
        }

        return <Typography.Text className="font-bold">{averageScore}</Typography.Text>
      },
    },
    {
      title: I18n.t('admin.scoring_final'),
      key: 'final',
      fixed: 'right',
      align: 'center',
      width: 200,
      className: styles.finalColumn,
      onHeaderCell: () => ({ className: styles.finalHeader }),
      render: (_value, record) => (record.isGroup || !record.factor ? null : renderFinalCell(record.factor)),
    },
  ]

  const isLoading = isFactorsLoading('fetch') || isFactorGroupsLoading('fetch')
    || isScoresLoading('fetch') || isFinalScoreLoading('fetch') || isWeightageLoading('fetch')

  if (!isLoading && columnsData.length === 0) return null

  return (
    <>
      <Flex justify="space-between" align="center" wrap="wrap" gap={8} className="mb-4">
        <AssessorLegend assessors={assessors} />
        <Flex gap={16}>
          <AssessmentGroupFilter
            assessmentGroups={assessmentGroups}
            visibleAssessmentGroupIds={visibleAssessmentGroups.map(group => group.id)}
            onChange={setVisibleAssessmentGroups}
          />
          <Button type="link" onClick={() => setExpandedRowKeys(collectGroupKeys(rows))}>
            {I18n.t('admin.expand_all')}
          </Button>
          <Button type="link" onClick={() => setExpandedRowKeys([])}>
            {I18n.t('admin.collapse_all')}
          </Button>
        </Flex>
      </Flex>

      {isLoading ? <Skeleton active /> : (
        <Table<ScoringRow>
          dataSource={rows}
          columns={columns}
          bordered
          pagination={false}
          rowClassName={record => (record.isGroup ? styles.groupRow : '')}
          scroll={{ x: 'max-content', y: SCORING_TABLE_SCROLL_Y }}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: keys => setExpandedRowKeys([...keys]),
          }}
        />
      )}

      <Flex justify="flex-end" gap={8} className="pt-6 pb-6 ps-2 pe-2">
        <Typography.Text className="self-center" type="danger">
          {scoresFinalized && I18n.t('admin.scores_finalized')}
        </Typography.Text>
        {factorWeightagesData.length > 0 && (
          <Button onClick={() => setOpen(true)}>{I18n.t('admin.scoring_show_weightages')}</Button>
        )}
        <Button onClick={handleReset} disabled={disabled || scoresFinalized}>
          {I18n.t('shared.reset')}
        </Button>
        <Button type="primary" disabled={disabled || disabledSave || scoresFinalized} onClick={handleSave}>
          {I18n.t('shared.save')}
        </Button>
      </Flex>

      <Modal
        open={open}
        title={I18n.t('admin.scoring_weightages_weightages')}
        onCancel={() => setOpen(false)}
        footer={null}
        width={1200}
      >
        {factorWeightagesData.length > 0 ? <Weightages /> : null}
      </Modal>
    </>
  )
}

export default ScoringTable
