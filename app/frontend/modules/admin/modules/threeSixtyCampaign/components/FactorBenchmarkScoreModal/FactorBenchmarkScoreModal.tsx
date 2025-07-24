import _ from 'lodash'
import {
  Modal, Button, Form, Col, Flex, InputNumber, message,
  Skeleton,
} from 'antd'
import { useEffect, useState } from 'react'
import { DeleteOutlined } from '@ant-design/icons'
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
  const {
    data, setData, memberAction, isLoading: factorsLoading,
  } = useResources<Factor>('dimensions', {
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      filter: { dimension_id_eq: dimensionId },
    },
  })

  const canManage = permissions.manageFactorBenchmarkScores

  const {
    fetch: fetchScores, collectionAction, isLoading: scoresLoading,
  } = useResources<BenchmarkScore>('factor_benchmark_scores', {
    basePath: `campaigns/${campaignId}`,
  })
  useEffect(() => {
    memberAction({
      id: dimensionId,
      action: 'factors',
      method: 'get',
    }).then((data: Factor[]) => {
      setData(data)
    })
    fetchScores().then(({ data }) => {
      setBenchmarks(data.reduce((acc, score) => ({ ...acc, [score.factorId]: { value: score.benchmarkScore } }), {}))
    })
  }, [])

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
          I18n.t('administration.threesixty_campaigns.messages.factor_benchmark_scores_updated'),
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
          {I18n.t('threesixty.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={scoresLoading('post/bulk_create')}
          disabled={scoresLoading('post/bulk_create')}
          onClick={handleSave}
        >
          {I18n.t('threesixty.save')}
        </Button>,
      ]}
    >
      <Flex vertical>
        <Flex className={styles.header}>
          <Col xs={12}>Factor:</Col>
          <Col flex={1}>Benchmark score:</Col>
        </Flex>
        <Flex vertical className={styles.body}>
          {(factorsLoading('get/factors') || scoresLoading('fetch'))
            ? <Skeleton />
            : data.map((factor, i) => (
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
        </Flex>
      </Flex>
    </Modal>
  )
}
