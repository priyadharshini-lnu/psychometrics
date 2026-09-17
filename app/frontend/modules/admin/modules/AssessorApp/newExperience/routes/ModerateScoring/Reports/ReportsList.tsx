import { FC, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Avatar, Button, Empty, Flex, Tabs, Typography, Skeleton,
} from '@thetalententerprise/glint'
import { useParams } from 'react-router-dom'
import bg from '~/modules/endUser/modules/campaigns/routes/Insights/media/Background2.png'
import { EyeOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import { fetchReports, FETCH_REPORTS } from '~/modules/admin/modules/AssessorApp/core/scoreModerate'
import { isRequestInProgress } from '~/core/request'
import ReportViewModal from './ReportViewModal'
import styles from './Reports.less'

const { I18n } = window

// UserReport fields are camelized at runtime by the API middleware
type RuntimeReport = {
  id: number
  campaignId: number
  name: string
  poster: string
  externalReport: boolean
}

const connector = connect((state: RootState) => ({
  userReports: state.assessors.scoreModerate.userReports,
  mainReportId: state.assessors.scoreModerate.mainReportId,
  mainReport: state.assessors.scoreModerate.mainReport,
  loading: isRequestInProgress(state, FETCH_REPORTS),
}), { fetchReports })

interface Props extends ConnectedProps<typeof connector> {
  header: (title: string, withoutBorder?: boolean) => React.ReactNode
}

const ReportsComponent: FC<Props> = ({
  fetchReports, userReports, mainReportId, mainReport, loading, header,
}) => {
  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  const [viewingReport, setViewingReport] = useState<RuntimeReport | null>(null)

  useEffect(() => {
    if (!userReports) {
      fetchReports(parseInt(campaignId!, 10), parseInt(userId!, 10))
    }
  }, [])

  const renderReportCard = (report: RuntimeReport) => (
    <div key={report.id} className={styles.reportRow}>
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={12}>
          <Avatar
            size={56}
            src={report.poster || bg}
            shape="square"
            className={styles.reportAvatar}
          >
            {report.name?.[0]?.toUpperCase()}
          </Avatar>
          <Typography.Text strong>{report.name}</Typography.Text>
        </Flex>
        <Button
          icon={<EyeOutlined />}
          onClick={() => setViewingReport(report)}
        >
          {I18n.t('shared.view')}
        </Button>
      </Flex>
    </div>
  )

  const buildTabItems = () => {
    const reports = (userReports as unknown as RuntimeReport[]) || []
    const mainReportData = mainReport as unknown as RuntimeReport | null

    const tabs: { key: string; label: string; children: React.ReactNode }[] = []

    if (mainReportId && mainReportData) {
      tabs.push({
        key: 'main',
        label: I18n.t('admin.main_report'),
        children: (
          <div className="p-4">
            {renderReportCard(mainReportData)}
          </div>
        ),
      })
    }

    tabs.push({
      key: 'others',
      label: I18n.t('admin.other_reports'),
      children: (
        <div className="p-4">
          {reports.length === 0 ? (
            <Flex align="center" justify="center" className="p-6">
              <Empty description={I18n.t('shared.no_data_found')} />
            </Flex>
          ) : (
            <>
              <Typography.Text type="secondary">
                {I18n.t('admin.reports_count', { count: reports.length })}
              </Typography.Text>
              {reports.map(report => renderReportCard(report))}
            </>
          )}
        </div>
      ),
    })

    if (!mainReportId && !mainReportData && reports.length === 0) {
      return [{
        key: 'empty',
        label: I18n.t('admin.other_reports'),
        children: (
          <Flex align="center" justify="center" flex={1} className="p-6">
            <Empty description={I18n.t('shared.no_data_found')} />
          </Flex>
        ),
      }]
    }

    return tabs
  }

  const renderBody = () => {
    if (!userReports || loading) return <Skeleton active className="p-4" />

    return (
      <Tabs
        defaultActiveKey={mainReportId ? 'main' : 'others'}
        items={buildTabItems()}
        tabBarStyle={{ padding: '0 12px', margin: 0 }}
      />
    )
  }

  return (
    <Flex vertical className="h-100">
      {header(I18n.t('admin.reports'))}
      <Flex vertical className={styles.reportsBody}>
        {renderBody()}
      </Flex>
      {viewingReport && (
        <ReportViewModal
          reportId={viewingReport.id}
          campaignId={viewingReport.campaignId}
          isExternal={viewingReport.externalReport}
          reportName={viewingReport.name}
          onClose={() => setViewingReport(null)}
        />
      )}
    </Flex>
  )
}

export const Reports = connector(ReportsComponent)
