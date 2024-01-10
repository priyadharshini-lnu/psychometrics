import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react'
import {
  Table, InputNumber, Skeleton, Flex, Button, Typography,
} from 'antd'
import { useParams } from 'react-router-dom'
import {
  Factor, FactorTR, Score, ScoreTR, CampaignFactorValue, CampaignFactorValueTR,
} from '~/modules/admin/modules/campaigns/core/combinedScoring'
import styles from './ScoringTable.less'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

const median = (a: number[]) => {
  const half = Math.floor(a.length / 2)
  a.sort((a, b) => a - b)
  if (a.length % 2) return a[half]
  return (a[half - 1] + a[half]) / 2.0
}

const calculateAverageScores = (
  columnsData: Factor[],
  evaluatorsData: Score[],
): Record<string, number | string> => {
  const averages: Record<string, string> = {}
  columnsData.forEach((factor) => {
    let total = 0
    let count = 0
    evaluatorsData.forEach((evaluator) => {
      const score = evaluator.scores[factor.factorId]
      if (score !== undefined && score !== null) {
        total += score
        count += 1
      }
    })
    averages[factor.factorId] = count > 0 ? (total / count).toFixed(1) : '-'
  })
  return averages
}
const calculateHighLowScores = (
  columnsData: Factor[],
  evaluatorsData: Score[],
): Record<string, { high: string, low: string }> => {
  const highLows: Record<string, { high: string, low: string }> = {}
  columnsData.forEach((factor) => {
    let high = -Infinity
    let low = Infinity
    evaluatorsData.forEach((evaluator) => {
      const score = evaluator.scores[factor.factorId]
      if (score !== undefined && score !== null) {
        high = Math.max(high, score)
        low = Math.min(low, score)
      }
    })
    highLows[factor.factorId] = {
      high: high === -Infinity ? '-' : high.toString(),
      low: low === Infinity ? '-' : low.toString(),
    }
  })
  return highLows
}

const sortEvaluatorsByEmail = (
  evaluators: Score[],
) => evaluators.slice().sort((a, b) => a.evaluator.email.localeCompare(b.evaluator.email))

const ScoringTable: React.FC = () => {
  const { campaignId, userId } = useParams<{ campaignId: string, userId: string }>()

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
        },
      },
    },
  )
  const [hasChanges, setHasChanges] = useState(false)
  const sortedEvaluatorsData = useMemo(() => sortEvaluatorsByEmail(evaluatorsData), [evaluatorsData])
  const averageScores = useMemo(() => calculateAverageScores(columnsData, evaluatorsData),
    [columnsData, evaluatorsData])
  const highLowScores = useMemo(() => calculateHighLowScores(columnsData, evaluatorsData),
    [columnsData, evaluatorsData])
  const [finalScores, setFinalScores] = useState<Record<string, number| string>>(averageScores)
  const factorIdToIdMap = useMemo(() => columnsData.reduce((acc, factor) => {
    acc[`factorId${factor.factorId}`] = factor.id
    acc[`CampaignFactorId${factor.id}`] = factor.factorId
    return acc
  }, {}), [columnsData])


  useEffect(() => {
    fetchScores()
    fetchFactors()
    fetchFinalScore()
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
    } else {
      Object.assign(newFinalScores, averageScores)
    }
    setFinalScores(newFinalScores)
    setHasChanges(false)
  }, [finalScoreData, averageScores, factorIdToIdMap])

  useEffect(() => {
    initializeFinalScores()
  }, [initializeFinalScores])


  const handleFinalScoreChange = (factorId: number, value: number | string | null) => {
    setFinalScores({ ...finalScores, [factorId]: value || '-' })
    setHasChanges(true)
  }

  const handleSave = () => {
    const scores = Object.keys(finalScores).map(key => ({
      campaign_factor_id: factorIdToIdMap[`factorId${key}`],
      score: Number(finalScores[key]),
    }))
    updateFinalScore(
      {
        action: 'save_assessor_scoring_factor_value',
        method: 'post',
        body: {
          scores,
          user_id: userId,
        },
      },
    )
    setHasChanges(false)
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
    assessors: 'Average',
    scores: averageScores,
    key: 'average',
  }

  const scoreRange = {
    assessors: 'Score range',
    key: 'scoreRange',
    scores: columnsData.reduce((acc, factor) => {
      const { high, low } = highLowScores[factor.factorId]
      acc[factor.factorId] = `${low} - ${high}`
      return acc
    }, {}),
  }


  const finalRow = {
    assessors: 'Final',
    key: 'final',
    scores: columnsData.reduce((acc, factor) => ({
      ...acc,
      [factor.factorId]: (
        <InputNumber
          min={0}
          value={finalScores[factor.factorId]}
          onChange={value => handleFinalScoreChange(factor.factorId, value)}
        />
      ),
    }), {}),
  }

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

  const columns = [
    {
      title: 'Assessors',
      dataIndex: 'assessors',
      key: 'assessors',
    },
    ...columnsData.map(factor => ({
      title: factor.name,
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

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>{I18n.t('administration.scoring.scoring')}</h3>
      {isFactorsLoading('fetch') && isFinalScoreLoading('fetch') && isScoresLoading('fetch') ? <Skeleton active />
        : (
          <Table
            dataSource={dataWithAverages.length ? [...dataWithAverages, averageRow, scoreRange, finalRow] : []}
            columns={columns}
            pagination={false}
            className={styles.table}
            rowClassName={rowClassName}
          />
        )}
      <Flex justify="flex-end" gap={8} style={{ padding: '2rem' }}>
        <Button
          onClick={handleReset}
          disabled={!hasChanges}
        >
          {I18n.t('administration.common.reset')}
        </Button>
        <Button
          type="primary"
          onClick={handleSave}
          disabled={!hasChanges}
        >
          {I18n.t('administration.common.save')}
        </Button>
      </Flex>
    </div>
  )
}

export default ScoringTable
