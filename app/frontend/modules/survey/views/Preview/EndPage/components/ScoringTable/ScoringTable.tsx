import { FC } from 'react'
import { Col, Row, Table } from 'antd'
import { CSVLink } from 'react-csv/lib/index'
import { CommonPropTypes } from 'react-csv/components/CommonPropTypes'
import map from 'lodash/map'
import find from 'lodash/find'
import _ from 'lodash'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface ScoringTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scoring: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  factors: any
  showScoringOnEndPage: boolean
  I18n: I18nInterface
  userAssessmentId: number
}

export const ScoringTable: FC<ScoringTableProps> = ({
  scoring,
  factors,
  showScoringOnEndPage,
  I18n,
  userAssessmentId,
}) => {
  if (!scoring || !showScoringOnEndPage || _.isEmpty(scoring)) {
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
        title={() => (
          <TableHeader
            userAssessmentId={userAssessmentId}
            columns={columns}
            data={data}
            I18n={I18n}
          />
        )}
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey={row => row.id}
      />
    </>
  )
}

interface TableHeaderProps {
  columns: {
    title: string
    dataIndex: string
    key: string
  }[]
  data: {
    id: string
    competency: string
    score: number
  }[]
  I18n: I18nInterface
  userAssessmentId: number
}

const TableHeader: FC<TableHeaderProps> = ({
  columns,
  data,
  I18n,
  userAssessmentId,
}) => {
  const headers: CommonPropTypes['headers'] = columns.map(column => ({
    label: column.title,
    key: column.key,
  }))

  return (
    <Row align="middle" justify="end">
      <Col>
        <CSVLink
          headers={headers}
          data={data}
          className="ant-btn"
          filename={`${userAssessmentId}-scoring.csv`}
        >
          {I18n.t('assessments.actions.download_csv')}
        </CSVLink>
      </Col>
    </Row>
  )
}
