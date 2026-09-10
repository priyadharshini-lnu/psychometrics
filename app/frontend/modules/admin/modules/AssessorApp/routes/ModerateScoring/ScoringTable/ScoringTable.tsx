import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react'
import {
  Table, InputNumber, Skeleton, Flex, Button, Typography, Modal, App, Popover,
  Switch,
  Tooltip,
} from 'antd'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import * as t from 'io-ts'
import type { ColumnsType } from 'antd/es/table'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE } from '~/modules/admin/constants/campaignFactors'
import {
  Factor, FactorTR, Score, ScoreTR, CampaignFactorValue, CampaignFactorValueTR, Weightage,
} from '~/modules/admin/modules/campaigns/core/combinedScoring'
import { median } from '~/utils/array'
import { EMPTY_SCORE_INDICATOR } from '~/modules/admin/constants/string'
import styles from './ScoringTable.less'
import { useResources } from '~/hooks/useResources'
import type { BaseMeta } from '~/hooks/useResources/interfaces'
import { Weightages } from './Weightages'
import { calculateAverageScores } from './commands/calculateAverageScores'
import { calculateHighLowScores } from './commands/calculateHighLowScores'
import { calculateWeightedAverageScores } from './commands/calculateWeightedAverageScores'
import { useMessageBus } from '~/hooks/useMessageBus'


const { I18n } = window

interface ScoringTableProps {
  onSave: () => void
  readOnly: boolean
  showsLoadedUser: boolean
}

type DataType = {
  [key: string]: string | number | boolean | null;
}
interface ScoresMeta extends BaseMeta {
  campaignScoresFinalized?: boolean
}

const getScoreStatus = (
  value: number | string | null | undefined,
  factor: Factor,
): '' | 'error' => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const numericValue = typeof value === 'number' ? value : Number(value)

  const { minValue, maxValue } = factor

  if ((minValue !== null && numericValue < minValue) || (maxValue !== null && numericValue > maxValue)) {
    return 'error'
  }

  return ''
}

const sortEvaluators = (
  evaluators: Score[],
) => evaluators.slice().sort((a, b) => {
  const emailCompare = a.evaluator.email.localeCompare(b.evaluator.email)
  if (emailCompare !== 0) return emailCompare
  return a.assessment.name.localeCompare(b.assessment.name, undefined, { numeric: true })
})

const processData = (dataWithAverages, averageRow, scoreRange, weightedAverageRow, finalRow): DataType[] => {
  if (dataWithAverages.length === 0) return []
  const baseData = [...dataWithAverages, averageRow, scoreRange]
  if (!_.isEmpty(weightedAverageRow.scores)) {
    baseData.push(weightedAverageRow)
  }
  if (finalRow.scores) {
    baseData.push(finalRow)
  }
  return baseData
}

const ScoringTable: React.FC<ScoringTableProps> = ({ onSave, readOnly, showsLoadedUser }) => {
  const { campaignId, userId } = useParams() as { campaignId: string, userId: string }
  const { message } = App.useApp()

  const {
    data: columnsData, fetch: fetchFactors, isLoading: isFactorsLoading,
  } = useResources<Factor>(
    'campaign_factors',
    {
      trackUrl: true,
      responseType: FactorTR,
      basePath: `campaigns/${campaignId}`,
      apiConfig: {
        filter: {
          factor_type_eq: 'assessor_scoring',
        },
        page: {
          size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE,
        },
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
        page: {
          size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE,
        },
      },
    },
  )

  const {
    data: factorWeightagesData,
    fetch: fetchFactorWeightages,
    isLoading: isWeightageLoading,
  } = useResources<Weightage>('campaign_assessor_assessment_factor_weights', {
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      page: {
        size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE,
      },
    },
  })

  const [disabled, setDisabled] = useState<boolean>(true)
  const [disabledSave, setDisabledSave] = useState<boolean>(false)
  const [enabledNAFactors, setEnabledNAFactors] = useState<Record<string, boolean>>({})

  const moderatableFactorIds = useMemo(() => new Set(
    columnsData
      .filter(factor => !factor.disallowLeadAssessorModeration)
      .map(factor => factor.factorId),
  ), [columnsData])
  const hasModeratableFactors = moderatableFactorIds.size > 0

  useMessageBus('lead_assessor_assessment:status_change', (status) => {
    if (status === 'completed') {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  })

  useMessageBus('assessment:finished', () => {
    handleSave()
  })

  const sortedEvaluatorsData = useMemo(() => sortEvaluators(evaluatorsData), [evaluatorsData])
  const averageScores = useMemo(() => calculateAverageScores(columnsData, evaluatorsData),
    [columnsData, evaluatorsData])
  const highLowScores = useMemo(() => calculateHighLowScores(columnsData, evaluatorsData),
    [columnsData, evaluatorsData])
  const weightedAverageScores = useMemo(() => calculateWeightedAverageScores(
    columnsData,
    evaluatorsData,
    factorWeightagesData,
  ),
  [columnsData, evaluatorsData, factorWeightagesData])
  const [finalScores, setFinalScores] = useState<Record<string, number| string | null>>(averageScores)
  const factorIdToIdMap = useMemo(() => columnsData.reduce((acc, factor) => {
    acc[`factorId${factor.factorId}`] = factor.id
    acc[`CampaignFactorId${factor.id}`] = factor.factorId
    return acc
  }, {}), [columnsData])

  const [open, setOpen] = useState(false)

  const showModal = () => {
    setOpen(true)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  useEffect(() => {
    fetchScores()
    fetchFactors()
    fetchFinalScore()
    fetchFactorWeightages()
  }, [userId])

  const initializeFinalScores = useCallback(() => {
    const newFinalScores = {}
    const newFinalNAScores = {}
    if (finalScoreData && finalScoreData.length > 0 && factorIdToIdMap) {
      finalScoreData.forEach((scoreData) => {
        const id = scoreData.campaignFactorId
        const factorId = factorIdToIdMap[`CampaignFactorId${id}`]
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
    setFinalScores({ ...finalScores, [factorId]: value })
  }

  const handleSave = () => {
    if (readOnly || !hasModeratableFactors) { return }

    const factorOutOfRange = Object.keys(finalScores).find((key) => {
      const factor = columnsData.find(f => f.factorId === key)

      if (!factor) return false

      const value = finalScores[key]
      const { minValue, maxValue } = factor

      if (enabledNAFactors[key] && value == null) {
        return false
      }

      if (minValue == null && maxValue == null && value == null) {
        message.error(I18n.t('admin.final_score_empty_err_msg', {
          factor_name: factor.name,
        }))
        return true
      }

      const numericValue = Number(value)

      if ((minValue !== null && numericValue < minValue)
         || (maxValue !== null && numericValue > maxValue)
         || (value == null && !enabledNAFactors[key]
         )) {
        message.error(I18n.t('admin.scoring_value_out_of_range_err_msg', {
          factor_name: factor.name,
          min: factor.minValue,
          max: factor.maxValue,
        }))
        return true
      }

      return false
    })

    if (factorOutOfRange) {
      return
    }

    const scores = Object.keys(finalScores)
      .filter(key => moderatableFactorIds.has(key))
      .map(key => ({
        campaign_factor_id: factorIdToIdMap[`factorId${key}`],
        score: Number.isNaN((finalScores[key])) ? Number(finalScores[key]) : finalScores[key],
      }))

    return updateFinalScore(
      {
        action: 'save_assessor_scoring_factor_value',
        method: 'post',
        responseType: t.string,
        body: {
          scores,
          user_id: userId,
        },
      },
    ).catch(() => {}).then(() => {
      message.success(I18n.t('admin.scoring_final_score_updated_successfully'))
      if (onSave) {
        onSave()
        setDisabled(true)
      }
    }).catch((errors) => {
      const errorMessage = errors?.base?.[0]?.title || I18n.t('shared.something_wrong')
      message.error(errorMessage)
    })
      .finally(() => {
        setDisabledSave(false)
      })
  }

  const handleReset = () => {
    initializeFinalScores()
  }

  let lastEmail:string | null = null
  const dataWithAverages = sortedEvaluatorsData.map((item) => {
    const isNewEvaluator = item.evaluator.email !== lastEmail
    lastEmail = item.evaluator.email
    return {
      assessors: isNewEvaluator
        ? (
          <div>
            <b>{`${item.evaluator.firstName} ${item.evaluator.lastName}`}</b>
            <div>{item.assessment.name}</div>
          </div>
        )
        : <div>{item.assessment.name}</div>,
      key: `${item.id}-${item.evaluator.email}`,
      scores: item.scores,
    }
  })


  const averageRow = {
    assessors: factorWeightagesData.length > 0
      ? `${I18n.t('admin.scoring_actual_average')}`
      : `${I18n.t('admin.scoring_average')}`,
    scores: averageScores,
    key: 'average',
  }

  const weightedAverageRow = {
    assessors: (
      <Flex vertical justify="flex-start">
        <span>{I18n.t('admin.scoring_weighted_average')}</span>
        <Button
          type="link"
          onClick={showModal}
          style={{ width: 'unset', display: 'flex', padding: 'unset' }
           }
        >
          {I18n.t('admin.scoring_show_weightages')}
        </Button>
      </Flex>
    ),
    scores: weightedAverageScores,
    key: 'weightedAverage',
  }

  const scoreRange = {
    assessors: `${I18n.t('admin.scoring_score_range')}`,
    key: 'scoreRange',
    scores: columnsData.reduce((acc, factor) => {
      const { high, low } = highLowScores[factor.factorId]
      acc[factor.factorId] = `${low} - ${high}`
      return acc
    }, {}),
  }


  const finalRow = useMemo(() => ({
    assessors: `${I18n.t('admin.scoring_final')}`,
    key: 'final',
    scores: columnsData.reduce((acc, factor) => ({
      ...acc,
      [factor.factorId]: (
        <>
          {enabledNAFactors[factor.factorId]
            ? (
              <Typography.Text className="mr16">
                {I18n.t('shared.na_text')}
              </Typography.Text>
            )
            : (
              <>
                <InputNumber
                  disabled={readOnly || scoresFinalized || factor.disallowLeadAssessorModeration}
                  status={getScoreStatus(finalScores[factor.factorId], factor)}
                  value={finalScores[factor.factorId]}
                  precision={2}
                  onChange={value => handleFinalScoreChange(factor.factorId, value)}
                />
                {
                 (!readOnly && (factor.minValue !== null
                   && factor.maxValue !== null)
                   && !factor.disallowLeadAssessorModeration) && (
                     <Tooltip
                       title={I18n.t('admin.scoring_value_info', {
                         min: factor.minValue,
                         max: factor.maxValue,
                       })}
                     >
                       <Button style={{ width: '20px' }} icon={<InfoCircleOutlined />} type="text" />
                     </Tooltip>
                 )}
                {factor.disallowLeadAssessorModeration && (
                  <Tooltip title={I18n.t('admin.auto_moderated_factor_info')}>
                    <Button style={{ width: '20px', marginLeft: '8px' }} icon={<InfoCircleOutlined />} type="text" />
                  </Tooltip>
                )}
              </>
            )}
          {columnsData.find(f => f.factorId === factor.factorId)?.isNaAllowed
           && (
             <Switch
               className="ml"
               onChange={(checked) => {
                 setEnabledNAFactors(prev => ({ ...prev, [factor.factorId]: checked }))
                 if (checked) {
                   handleFinalScoreChange(factor.factorId, null)
                 }
               }}
               checked={!!enabledNAFactors[factor.factorId]}
               checkedChildren={I18n.t('shared.na_text')}
               unCheckedChildren={I18n.t('shared.na_text')}
               disabled={readOnly || scoresFinalized || factor.disallowLeadAssessorModeration}
             />
           )}
        </>
      ),
    }), {}),
  }), [finalScores, columnsData, readOnly, scoresFinalized, enabledNAFactors])

  const rowClassName = (record, index): string => {
    if (record.key === 'final') {
      return styles.finalRow
    } if (record.key === 'average') {
      return `${styles.averageRow} ${styles.noBottomBorder}`
    } if (record.key === 'scoreRange') {
      return styles.scoreRange
    }
    const currentEmail = record.key.split(EMPTY_SCORE_INDICATOR)[1]
    const nextRecord = dataWithAverages[index + 1]
    const nextEmail = nextRecord ? nextRecord.key.split(EMPTY_SCORE_INDICATOR)[1] : null

    if (currentEmail === nextEmail) {
      return styles.noBottomBorder
    }
    return ''
  }

  const medians = useMemo(() => {
    if (columnsData.length === 0) return {}

    return columnsData.reduce((acc, factor) => {
      const factorValues: number[] = evaluatorsData
        .map(e => e.scores[factor.factorId])
        .filter((v): v is number => v !== null)

      acc[factor.name] = median(factorValues)
      return acc
    }, {})
  }, [columnsData, evaluatorsData])

  const columns: ColumnsType<DataType> = [
    {
      title: 'Assessors',
      dataIndex: 'assessors',
      key: 'assessors',
      fixed: 'left',
    },
    ...columnsData.map(factor => ({
      title: <Popover title={factor.name} content={factor.description}>{factor.name}</Popover>,
      dataIndex: ['scores', factor.factorId],
      key: factor.factorId,
      render: (score) => {
        if (score === undefined) return EMPTY_SCORE_INDICATOR
        if (typeof score !== 'number') return score
        const medianDistance = Math.abs((medians[factor.name] / score) - 1)
        if (medianDistance <= 0.25) {
          return <Typography.Text>{score}</Typography.Text>
        } if (medianDistance > 0.25 && medianDistance < 0.75) {
          return <Typography.Text type="warning">{score}</Typography.Text>
        } if (medianDistance >= 0.75) {
          return <Typography.Text type="danger">{score}</Typography.Text>
        }
      },
    })),
  ]

  const dataSource = useMemo(() => processData(
    dataWithAverages,
    averageRow,
    scoreRange,
    weightedAverageRow,
    finalRow,
  ), [dataWithAverages, averageRow, scoreRange, weightedAverageRow, finalRow])

  if (columnsData.length === 0) return null

  return (
    <>
      <div className={styles.container}>
        <h3 className={styles.header}>{I18n.t('admin.scoring_scoring')}</h3>
        {!showsLoadedUser
        || isFactorsLoading('fetch')
        || isFinalScoreLoading('fetch')
        || isScoresLoading('fetch')
        || isWeightageLoading('fetch') ? <Skeleton active />
          : (
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              className={styles.table}
              rowClassName={rowClassName}
              scroll={{ x: 'max-content' }}
            />
          )}
        <Flex justify="flex-end" gap={8} style={{ padding: '2rem' }}>
          <Typography.Text
            className="self-center"
            type="danger"
          >
            {scoresFinalized && I18n.t('admin.scores_finalized')}
          </Typography.Text>
          {hasModeratableFactors && (
            <>
              <Button onClick={handleReset} disabled={readOnly || disabled || scoresFinalized}>
                {I18n.t('shared.reset')}
              </Button>
              <Button
                type="primary"
                disabled={readOnly || disabled || disabledSave || scoresFinalized}
                onClick={handleSave}
              >
                {I18n.t('shared.save')}
              </Button>
            </>
          )}
        </Flex>
      </div>
      <Modal
        open={open}
        title={I18n.t('admin.scoring_weightages_weightages')}
        onCancel={handleCancel}
        footer={<></>}
        width={1200}
      >
        {factorWeightagesData.length > 0
          ? <Weightages /> : null
          }
      </Modal>
    </>
  )
}

export default ScoringTable
