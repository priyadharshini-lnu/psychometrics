import React from 'react'
import { Table, Tag, Typography } from '@thetalententerprise/glint'
import {
  CompletionStatus, statusColorMap, statusLabelKey,
} from '../../consts'

const { I18n } = window

export interface AssessmentRecord {
  id: number
  assessmentName: string
  status?: string
}

const getStatusTag = (status: string) => {
  const color = statusColorMap[status as CompletionStatus]
  const labelKey = statusLabelKey[status as CompletionStatus]

  if (!color || !labelKey) {
    return <Typography.Text>{I18n.t('shared.na_text')}</Typography.Text>
  }

  return <Tag color={color}>{I18n.t(labelKey)}</Tag>
}

interface Props {
  assessments: AssessmentRecord[]
}

const AssessmentsList: React.FC<Props> = ({ assessments }) => {
  const columns = [
    {
      title: I18n.t('common.column.id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: I18n.t('admin.assessor_user_assessment_name'),
      dataIndex: 'assessmentName',
      key: 'assessmentName',
    },
    {
      title: I18n.t('admin.completed'),
      key: 'completed',
      render: (_: unknown, record: AssessmentRecord) => getStatusTag(record.status ?? ''),
    },
  ]

  return (
    <>
      <div className="mt-6 mb-4">
        <Typography.Title level={4} className="ps-6 mb-0">
          {`${I18n.t('admin.assessments')} (${assessments.length})`}
        </Typography.Title>
      </div>
      <Table
        dataSource={assessments}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
    </>
  )
}

export default AssessmentsList
