import React, { useState, useEffect } from 'react'
import {
  Table, Input, Button, Typography, Form,
} from 'antd'
import type { TableColumnsType, FormInstance } from 'antd'

const { I18n } = window

interface ScoreDefinition {
  score: number
  definition: string
}

type Props = {
  scoreDefinitions: ScoreDefinition[]
  form: FormInstance
}

export const ScoreDefinitions: React.FC<Props> = ({ scoreDefinitions, form }) => {
  const [showMiddleScores, setShowMiddleScores] = useState(false)

  useEffect(() => {
    if (form && scoreDefinitions.length > 0) {
      form.setFieldValue('scoreDefinitions', scoreDefinitions)
    }
  }, [scoreDefinitions, form])

  return (
    <div className="mtm mbm">
      <Typography.Title level={5}>{I18n.t('admin.score_definitions')}</Typography.Title>
      <Form.List name="scoreDefinitions">
        {(fields) => {
          const minField = fields[0]
          const maxField = fields[fields.length - 1]
          const middleFields = fields.slice(1, -1)

          const tableData: Array<{ key: number | string; index: number; score: number | string }> = []

          if (minField !== undefined) {
            tableData.push({
              key: minField.key,
              index: minField.name,
              score: scoreDefinitions[minField.name]?.score,
            })
          }

          if (middleFields.length > 0) {
            if (showMiddleScores) {
              middleFields.forEach((field) => {
                tableData.push({
                  key: field.key,
                  index: field.name,
                  score: scoreDefinitions[field.name]?.score,
                })
              })
            } else {
              tableData.push({
                key: 'expand',
                index: -1,
                score: 'expand',
              })
            }
          }

          if (maxField !== undefined) {
            tableData.push({
              key: maxField.key,
              index: maxField.name,
              score: scoreDefinitions[maxField.name]?.score,
            })
          }

          const columns: TableColumnsType<typeof tableData[number]> = [
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
              key: 'definition',
              render: (_: unknown, record: typeof tableData[number]) => {
                if (record.score === 'expand') {
                  return (
                    <Button
                      type="link"
                      onClick={() => setShowMiddleScores(true)}
                      style={{ padding: 0, textAlign: 'left' }}
                    >
                      {I18n.t('admin.show_middle_scores', { count: middleFields.length })}
                    </Button>
                  )
                }

                return (
                  <Form.Item
                    name={[record.index, 'definition']}
                    noStyle
                  >
                    <Input.TextArea
                      placeholder={I18n.t('admin.score_definition_placeholder')}
                      autoSize
                    />
                  </Form.Item>
                )
              },
            },
          ]

          return (
            <>
              <Table
                columns={columns}
                dataSource={tableData}
                rowKey={record => String(record.key)}
                pagination={false}
                size="small"
              />
              {showMiddleScores && middleFields.length > 0 && (
                <Button
                  type="link"
                  onClick={() => setShowMiddleScores(false)}
                  style={{ padding: '8px 0' }}
                >
                  {I18n.t('admin.hide_middle_scores')}
                </Button>
              )}
              {/* Hidden fields to preserve score values */}
              {fields.map(field => (
                <Form.Item key={field.key} name={[field.name, 'score']} hidden>
                  <Input />
                </Form.Item>
              ))}
            </>
          )
        }}
      </Form.List>
    </div>
  )
}
