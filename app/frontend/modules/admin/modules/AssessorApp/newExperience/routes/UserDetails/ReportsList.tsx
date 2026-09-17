import React, { useState } from 'react'
import {
  Table, Tag, Typography, Button, Tooltip,
} from '@thetalententerprise/glint'
import { EyeOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ReportViewModal from '../ModerateScoring/Reports/ReportViewModal'

const { I18n } = window

export interface ReportRecord {
  id: number
  name: string
  internal: boolean
  status: string
  reportUrl: string | null
  unavailabilityReasonDetails?: { reasonMessage: string } | null
}

interface Props {
  reports: ReportRecord[]
  campaignId: number
}

const ReportsList: React.FC<Props> = ({ reports, campaignId }) => {
  const [viewingReport, setViewingReport] = useState<ReportRecord | null>(null)

  const getStatusTag = (record: ReportRecord) => {
    const label = I18n.t(`user_reports.statuses.${record.status}`)
    const color = record.status === 'prepared' ? 'green' : 'default'
    const tag = <Tag color={color}>{label}</Tag>
    const reason = record.unavailabilityReasonDetails?.reasonMessage

    if (record.status === 'not_prepared' && reason) {
      return <Tooltip title={reason}>{tag}</Tooltip>
    }

    return tag
  }

  const columns = [
    {
      title: I18n.t('common.column.id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: I18n.t('admin.assessor_user_assessment_name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: I18n.t('admin.completed'),
      key: 'status',
      render: (_: unknown, record: ReportRecord) => getStatusTag(record),
    },
    {
      title: I18n.t('common.column.action'),
      key: 'action',
      render: (_: unknown, record: ReportRecord) => (
        <Button
          icon={<EyeOutlined />}
          disabled={!(record.internal || record.reportUrl) || record.status !== 'prepared'}
          onClick={() => setViewingReport(record)}
          aria-label={I18n.t('reports.actions.view')}
        />
      ),
    },
  ]

  return (
    <>
      <div className="mt-6 mb-4">
        <Typography.Title level={4} className="ps-6 mb-0">
          {`${I18n.t('admin.reports')} (${reports.length})`}
        </Typography.Title>
      </div>
      <Table
        dataSource={reports}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
      {viewingReport && (
        <ReportViewModal
          reportId={viewingReport.id}
          campaignId={campaignId}
          isExternal={!viewingReport.internal}
          reportName={viewingReport.name}
          onClose={() => setViewingReport(null)}
        />
      )}
    </>
  )
}

export default ReportsList
