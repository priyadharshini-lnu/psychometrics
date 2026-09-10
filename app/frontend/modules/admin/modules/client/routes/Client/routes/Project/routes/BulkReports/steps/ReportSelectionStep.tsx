import {
  FC, useMemo, useState,
} from 'react'
import type { ColumnsType } from 'antd/es/table'
import {
  Typography, Flex, Empty, Alert, Tag, Table,
} from 'antd'
import { deriveSelectedReports } from '../core'
import { LocalCampaign, DerivedReport } from '../types'
import styles from './SelectionTableRows.less'

export type { DerivedReport }

const { Text } = Typography
const { I18n } = window
const PAGE_SIZE = 25

type Props = {
  selectedCampaigns: LocalCampaign[]
  selectedReportIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  totalSelectedCampaigns: number
}

const ReportSelectionStep: FC<Props> = ({
  selectedCampaigns,
  selectedReportIds,
  onSelectionChange,
  totalSelectedCampaigns,
}) => {
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const reports = useMemo<DerivedReport[]>(
    () => deriveSelectedReports(selectedCampaigns, new Set(
      selectedCampaigns.flatMap(c => (c.campaignReports ?? []).map(cr => String(cr.report?.id)).filter(Boolean)),
    )),
    [selectedCampaigns],
  )
  const totalReports = reports.length

  const campaignsWithNoReports = useMemo(
    () => selectedCampaigns.filter(c => !c.campaignReports?.length),
    [selectedCampaigns],
  )

  const toggleReport = (reportId: string) => {
    const next = new Set(selectedReportIds)
    if (next.has(reportId)) {
      next.delete(reportId)
    } else {
      next.add(reportId)
    }
    onSelectionChange(next)
  }

  const columns: ColumnsType<DerivedReport> = [
    {
      key: 'report',
      render: (_, report) => (
        <div style={{ minWidth: 0 }}>
          <Flex align="center" gap={8} style={{ marginBottom: report.description ? 5 : 0 }}>
            <Text strong style={{ fontSize: 14, lineHeight: '1.4' }}>
              {report.name}
            </Text>
            <Tag style={{ margin: 0, fontFamily: 'monospace', fontSize: 10.5 }}>
              {report.format}
            </Tag>
          </Flex>
          {report.description && (
            <Text type="secondary" style={{ fontSize: 13, lineHeight: '1.5' }}>
              {report.description}
            </Text>
          )}
        </div>
      ),
    },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden',
    }}
    >
      <div style={{ flexShrink: 0 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
          {I18n.t('admin.bulk_reports_select_reports')}
        </Text>
        <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 13.5 }}>
          {I18n.t('admin.bulk_reports_select_reports_description')}
        </Text>

        {campaignsWithNoReports.length > 0 && totalReports > 0 && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message={I18n.t('admin.bulk_reports_campaigns_without_reports_warning', {
              count: campaignsWithNoReports.length,
              total: totalSelectedCampaigns,
            })}
          />
        )}
      </div>

      {totalReports === 0 ? (
        <Empty
          description={(
            <Text type="secondary">
              {I18n.t('admin.bulk_reports_no_reports_configured')}
            </Text>
          )}
          style={{ padding: '24px 0' }}
        />
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Table<DerivedReport>
            className={styles.selectionTable}
            rowKey="reportId"
            dataSource={reports}
            columns={columns}
            showHeader={false}
            rowClassName={report => (selectedReportIds.has(report.reportId) ? styles.selectedRow : '')}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: [...selectedReportIds],
              preserveSelectedRowKeys: true,
              onChange: ids => onSelectionChange(new Set(ids.map(String))),
            }}
            onRow={report => ({
              onClick: () => toggleReport(report.reportId),
              onKeyDown: e => e.key === 'Enter' && toggleReport(report.reportId),
              tabIndex: 0,
              style: { cursor: 'pointer' },
            })}
            pagination={{
              pageSize,
              total: totalReports,
              showSizeChanger: true,
              hideOnSinglePage: true,
              onChange: (_page, size) => setPageSize(size),
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ReportSelectionStep
