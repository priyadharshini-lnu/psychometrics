import React, { useState } from 'react'
import {
  Table, Input, Button, Typography,
} from 'antd'
import type { TableColumnsType } from 'antd'

const { I18n } = window

interface ScoreDefinition {
  score: number
  definition: string
}

type Props = {
  scoreDefinitions: ScoreDefinition[]
  onChange: (event: { currentTarget: { name: string; value: ScoreDefinition[] } }) => void
}

const ScoreDefinitions: React.FC<Props> = ({ scoreDefinitions, onChange }) => {
  const [showMiddleScores, setShowMiddleScores] = useState(false)

  const handleDefinitionChange = (score: number, value: string) => {
    const updatedDefinitions = scoreDefinitions.map((def) => {
      if (def.score === score) {
        return { ...def, definition: value }
      }
      return def
    })

    onChange({
      currentTarget: {
        name: 'score_definitions',
        value: updatedDefinitions,
      },
    })
  }

  const minScore = scoreDefinitions[0]
  const maxScore = scoreDefinitions[scoreDefinitions.length - 1]
  const middleScores = scoreDefinitions.slice(1, -1)

  type TableRow = ScoreDefinition | { score: string; definition: string }
  const tableData: TableRow[] = []
  if (minScore) {
    tableData.push(minScore)
  }

  if (middleScores.length > 0) {
    if (showMiddleScores) {
      tableData.push(...middleScores)
    } else {
      tableData.push({ score: 'expand', definition: '' })
    }
  }

  if (maxScore) {
    tableData.push(maxScore)
  }

  const expandedColumns: TableColumnsType<ScoreDefinition | { score: string; definition: string }> = [
    {
      title: I18n.t('admin.score'),
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score: number | string) => {
        if (score === 'expand') {
          return null
        }
        return <strong>{score}</strong>
      },
    },
    {
      title: I18n.t('admin.definition'),
      dataIndex: 'definition',
      key: 'definition',
      render: (_: string, record: ScoreDefinition | { score: string; definition: string }) => {
        if (record.score === 'expand') {
          return (
            <Button
              type="link"
              onClick={() => setShowMiddleScores(true)}
              style={{ padding: 0, textAlign: 'left' }}
            >
              {I18n.t('admin.show_middle_scores', { count: middleScores.length })}
            </Button>
          )
        }
        return (
          <Input.TextArea
            value={record.definition}
            onChange={e => handleDefinitionChange(record.score as number, e.target.value)}
            placeholder={I18n.t('admin.score_definition_placeholder')}
            autoSize
          />
        )
      },
    },
  ]

  return (
    <div className="mtm mbm">
      <Typography.Title level={5}>{I18n.t('admin.score_definitions')}</Typography.Title>
      <Table
        columns={expandedColumns}
        dataSource={tableData}
        rowKey={record => String(record.score)}
        pagination={false}
        size="small"
      />
      {showMiddleScores && middleScores.length > 0 && (
        <Button
          type="link"
          onClick={() => setShowMiddleScores(false)}
          style={{ padding: '8px 0' }}
        >
          {I18n.t('admin.hide_middle_scores')}
        </Button>
      )}
    </div>
  )
}

export default ScoreDefinitions
