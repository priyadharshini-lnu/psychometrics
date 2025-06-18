import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react'
import {
  Table, InputNumber, Skeleton, Flex, Button, Typography, Modal, App, Popover,
} from 'antd'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import type { ColumnsType } from 'antd/es/table'
import { CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE } from '~/modules/admin/constants/campaignFactors'
import {
  Factor, FactorTR, Score, ScoreTR, CampaignFactorValue, CampaignFactorValueTR, Weightage,
} from '~/modules/admin/modules/campaigns/core/combinedScoring'
import { median } from '~/utils/array'
import styles from './ScoringTable.less'
import { useResources } from '~/hooks/useResources'
import { Weightages } from './Weightages'
import { calculateAverageScores } from './commands/calculateAverageScores'
import { calculateHighLowScores } from './commands/calculateHighLowScores'
import { calculateWeightedAverageScores } from './commands/calculateWeightedAverageScores'
import { useMessageBus } from '~/hooks/useMessageBus'


const { I18n } = window

interface ScoringTableProps {
  onSave: () => void
  readOnly: boolean
}

type DataType = {
  [key: string]: string | number | boolean | null;
}
const sortEvaluatorsByEmail = (
  evaluators: Score[],
) => evaluators.slice().sort((a, b) => a.evaluator.email.localeCompare(b.evaluator.email))

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

const ScoringTable: React.FC<ScoringTableProps> = ({ onSave, readOnly }) => {
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
    data: evaluatorsData, fetch: fetchScores, isLoading: isScoresLoading,
  } = useResources<Score>(
    'assessors_scores',
    {
      trackUrl: true,
      responseType: ScoreTR,
      basePath: `campaigns/${campaignId}/users/${userId}`,
    },
  )

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

  const sortedEvaluatorsData = useMemo(() => sortEvaluatorsByEmail(evaluatorsData), [evaluatorsData])
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
  const [finalScores, setFinalScores] = useState<Record<string, number| string>>(averageScores)
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
  }, [])

  const initializeFinalScores = useCallback(() => {
    const newFinalScores = {}
    if (finalScoreData && finalScoreData.length > 0 && factorIdToIdMap) {
      finalScoreData.forEach((scoreData) => {
        const id = scoreData.campaignFactorId
        const factorId = factorIdToIdMap[`CampaignFactorId${id}`]
        if (factorId) {
          newFinalScores[factorId] = scoreData.numericValue || scoreData.stringValue || '-'
        }
      })
    } else if (weightedAverageScores && Object.keys(weightedAverageScores).length > 0) {
      Object.assign(newFinalScores, weightedAverageScores)
    } else {
      Object.assign(newFinalScores, averageScores)
    }
    setFinalScores(newFinalScores)
  }, [finalScoreData, weightedAverageScores, averageScores, factorIdToIdMap])

  useEffect(() => {
    initializeFinalScores()
  }, [initializeFinalScores])

  const handleFinalScoreChange = (factorId: string, value: number | string | null) => {
    setFinalScores({ ...finalScores, [factorId]: value || '-' })
  }

  const handleSave = () => {
    if (readOnly) { return }

    setDisabledSave(true)
    const scores = Object.keys(finalScores).map(key => ({
      campaign_factor_id: factorIdToIdMap[`factorId${key}`],
      score: Number(finalScores[key]),
    }))
    return updateFinalScore(
      {
        action: 'save_assessor_scoring_factor_value',
        method: 'post',
        body: {
          scores,
          user_id: userId,
        },
      },
    ).catch(() => {}).then(() => {
      message.success(I18n.t('administration.scoring.final_score_updated_successfully'))
      if (onSave) {
        onSave()
        setDisabled(true)
      }
    }).finally(() => {
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
      ? `${I18n.t('administration.scoring.actual_average')}`
      : `${I18n.t('administration.scoring.average')}`,
    scores: averageScores,
    key: 'average',
  }

  const weightedAverageRow = {
    assessors: (
      <Flex vertical justify="flex-start">
        <span>{I18n.t('administration.scoring.weighted_average')}</span>
        <Button
          type="link"
          onClick={showModal}
          style={{ width: 'unset', display: 'flex', padding: 'unset' }
           }
        >
          {I18n.t('administration.scoring.show_weightages')}
        </Button>
      </Flex>
    ),
    scores: weightedAverageScores,
    key: 'weightedAverage',
  }

  const scoreRange = {
    assessors: `${I18n.t('administration.scoring.score_range')}`,
    key: 'scoreRange',
    scores: columnsData.reduce((acc, factor) => {
      const { high, low } = highLowScores[factor.factorId]
      acc[factor.factorId] = `${low} - ${high}`
      return acc
    }, {}),
  }


  const finalRow = useMemo(() => ({
    assessors: `${I18n.t('administration.scoring.final')}`,
    key: 'final',
    scores: columnsData.reduce((acc, factor) => ({
      ...acc,
      [factor.factorId]: (
        <InputNumber
          disabled={readOnly}
          min={0}
          value={finalScores[factor.factorId]}
          onChange={value => handleFinalScoreChange(factor.factorId, value)}
        />
      ),
    }), {}),
  }), [finalScores, columnsData, readOnly])

  const rowClassName = (record, index): string => {
    if (record.key === 'final') {
      return styles.finalRow
    } if (record.key === 'average') {
      return `${styles.averageRow} ${styles.noBottomBorder}`
    } if (record.key === 'scoreRange') {
      return styles.scoreRange
    }
    const currentEmail = record.key.split('-')[1]
    const nextRecord = dataWithAverages[index + 1]
    const nextEmail = nextRecord ? nextRecord.key.split('-')[1] : null

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
        if (score === undefined) return '-'
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
        <h3 className={styles.header}>{I18n.t('administration.scoring.scoring')}</h3>
        {isFactorsLoading('fetch')
        && isFinalScoreLoading('fetch')
        && isScoresLoading('fetch')
        && isWeightageLoading('fetch') ? <Skeleton active />
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
          <Button onClick={handleReset} disabled={disabled}>
            {I18n.t('administration.common.reset')}
          </Button>
          <Button
            type="primary"
            disabled={disabled || disabledSave}
            onClick={handleSave}
          >
            {I18n.t('administration.common.save')}
          </Button>
        </Flex>
      </div>
      <Modal
        open={open}
        title={I18n.t('administration.scoring.weightages.weightages')}
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
