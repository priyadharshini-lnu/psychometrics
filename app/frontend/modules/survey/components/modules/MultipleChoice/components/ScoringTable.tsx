import { FC } from 'react'
import { Table } from 'antd'
import map from 'lodash/map'
import find from 'lodash/find'

import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import {
  getQuestionScoring,
} from '~/modules/survey/core/preview/FlowProcessor/selectors'

interface ScoringTableProps {
  scoring: ReturnType<typeof getQuestionScoring>
  factors: {id: number, name: string}[]
  I18n: I18nInterface
}

export const ScoringTable: FC<ScoringTableProps> = ({
  scoring,
  factors,
  I18n,
}) => {
  if (!scoring) {
    return null
  }

  const data = map(scoring, (s, id) => ({
    id,
    competency: find(factors, { id: +id })?.name,
    score: s.score,
  }))

  const columns = [
    {
      title: I18n.t('assessments.scoring.id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: I18n.t('assessments.scoring.competency'),
      dataIndex: 'competency',
      key: 'competency',
    },
    {
      title: I18n.t('assessments.scoring.score'),
      dataIndex: 'score',
      key: 'score',
    },
  ]

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey={row => row.id}
      />
    </>
  )
}
