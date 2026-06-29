import _ from 'lodash'
import {
  Modal, Button, Form, Col, Flex, InputNumber, message,
  Skeleton,
} from 'antd'
import {
  useEffect, useState, useRef, useCallback,
} from 'react'
import { DeleteOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import styles from './styles.less'

const { I18n } = window
enum Operation {
  ADD = 'add',
  MODIFY = 'modify',
  DELETE = 'delete',
}

interface Factor {
  id: string
  name: string
}

interface BenchmarkScore {
  id: string
  score: number
  factorId: string
  benchmarkScore: string
}

export default function FactorBenchmarkScoreModal ({
  campaignId, dimensionId, permissions,
  close,
}) {
  const [benchmarks, setBenchmarks] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [data, setData] = useState<Factor[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const {
    meta, fetch: fetchFactors, isLoading: factorsLoading,
  } = useResources<Factor>('factors', {
    basePath: `campaigns/${campaignId}/dimensions/${dimensionId}`,
  })

  const canManage = permissions.manageFactorBenchmarkScores

  const {
    fetch: fetchScores, collectionAction, isLoading: scoresLoading,
  } = useResources<BenchmarkScore>('factor_benchmark_scores', {
    basePath: `campaigns/${campaignId}`,
  })

  useEffect(() => {
    fetchFactors({
      apiConfig: {
        page: { size: 25, number: currentPage },
      },
    }).then(({ data }) => {
      setData(data)
    })
    fetchScores().then(({ data }) => {
      setBenchmarks(data.reduce((acc, score) => ({ ...acc, [score.factorId]: { value: score.benchmarkScore } }), {}))
    })
  }, [])

  const loadMoreData = useCallback(() => {
    if (factorsLoading('fetch')) {
      return
    }

    const nextPage = currentPage + 1

    // Only load if there are more pages available
    if (meta && meta.pageCount && nextPage <= meta.pageCount) {
      fetchFactors({
        apiConfig: {
          page: { size: 25, number: nextPage },
        },
      }).then(({ data: newData }) => {
        if (newData && newData.length > 0) {
          setData(prevData => [...prevData, ...newData])
          setCurrentPage(nextPage)
        }
      })
    }
  }, [currentPage, meta, fetchFactors, factorsLoading])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

    // Load more when user scrolls to 90% of the content
    if (scrollTop + clientHeight >= scrollHeight * 0.9) {
      loadMoreData()
    }
  }, [loadMoreData])

  const handleOnCancel = () => {
    close()
  }

  const handleSave = () => {
    if (!canManage) return

    collectionAction({
      action: 'bulk_create',
      method: 'post',
      body: benchmarks,
    }).then((response) => {
      if (response === 'ok') {
        message.success(
          I18n.t('admin.factor_benchmark_scores_updated'),
        )
        close()
      }
    })
  }

  const change = (factor, value) => {
    if (benchmarks[factor.id] && benchmarks[factor.id]?.operation !== Operation.ADD) {
      setBenchmarks({ ...benchmarks, [factor.id]: { operation: Operation.MODIFY, value } })
    } else {
      setBenchmarks({ ...benchmarks, [factor.id]: { operation: Operation.ADD, value } })
    }
  }

  const remove = (factor) => {
    if (benchmarks[factor.id]?.operation === Operation.ADD) {
      setBenchmarks(_.omit(benchmarks, factor.id))
    } else {
      setBenchmarks({ ...benchmarks, [factor.id]: { operation: Operation.DELETE } })
    }
  }

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.actions.factor_benchmark_score')}
      open
      onCancel={handleOnCancel}
      footer={canManage && [
        <Button key="back" onClick={handleOnCancel}>
          {I18n.t('shared.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={scoresLoading('post/bulk_create')}
          disabled={scoresLoading('post/bulk_create')}
          onClick={handleSave}
        >
          {I18n.t('shared.save')}
        </Button>,
      ]}
    >
      <Flex vertical>
        <Flex className={styles.header}>
          <Col xs={12}>Factor:</Col>
          <Col flex={1}>Benchmark score:</Col>
        </Flex>
        <Flex vertical className={styles.body}>
          {((factorsLoading('fetch') && !data.length) || scoresLoading('fetch'))
            ? <Skeleton />
            : (
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                {data.map((factor, i) => (
                  <Form.Item
                    key={factor.id}
                    label={factor.name}
                    labelAlign="left"
                    labelCol={{ xs: 12 }}
                    className={styles.row}
                  >
                    <Flex>
                      <InputNumber
                        tabIndex={i + 1}
                        className="w-100"
                        value={benchmarks[factor.id]?.value}
                        onChange={val => change(factor, val)}
                        disabled={!canManage}
                      />
                      {canManage
                        && (
                          <Button
                            disabled={!benchmarks[factor.id]?.value}
                            type="link"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(factor)}
                          />
                        )
                    }
                    </Flex>
                  </Form.Item>
                ))}
                {factorsLoading('fetch') && (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <Skeleton paragraph={{ rows: 1 }} active />
                  </div>
                )}
              </div>
            )}
        </Flex>
      </Flex>
    </Modal>
  )
}
