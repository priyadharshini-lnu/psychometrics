import { FC } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from 'antd'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { formatedDate } from '~/utils/time'
import { BulkReportJob } from './types'

const { I18n } = window

const BulkReports: FC = () => {
  const { projectId } = useParams() as { projectId: string }
  const navigate = useNavigate()

  const config = {
    basePath: `projects/${projectId}`,
    apiConfig: {
      sort: '-created_at',
      fields: {
        bulk_report_jobs: ['status', 'created_at', 'start_date', 'end_date', 'files_count'],
      },
    },
  }

  const Filter = (
    <Resource.Filter name="id_eq">
      <Button
        type="primary"
        onClick={() => navigate(`/admin/projects/${projectId}/bulk_reports/generate`)}
        icon={<DownloadOutlined />}
      >
        {I18n.t('admin.bulk_reports_generate_export')}
      </Button>
    </Resource.Filter>
  )

  return (
    <Resource<BulkReportJob, BaseMeta>
      config={config}
      name="bulk_report_jobs"
      settingsKey={TABLE_SETTINGS_KEYS.projectBulkReports}
      title={I18n.t('admin.bulk_reports')}
    >
      {Filter}
      <Resource.Table pagination>
        <Resource.Column<BulkReportJob>
          title={I18n.t('shared.id')}
          id="id"
          dataIndex="id"
          sorter
          width={220}
          render={(id: number) => (
            <Link to={`/admin/projects/${projectId}/bulk_reports/${id}`}>{id}</Link>
          )}
        />
        <Resource.Column<BulkReportJob>
          title={I18n.t('admin.data_reports_columns_created_at')}
          id="created_at"
          dataIndex="createdAt"
          render={(value: string) => (value ? formatedDate(value) : '-')}
          width={220}
        />
        <Resource.Column<BulkReportJob>
          title={I18n.t('shared.status')}
          id="status"
          dataIndex="status"
          width={220}
          render={(value: string) => (value ? I18n.t(`shared.${value}`) : '-')}
        />
        <Resource.Column<BulkReportJob>
          title={I18n.t('admin.date_range')}
          id="date_range"
          render={(_: unknown, record: BulkReportJob) => {
            if (!record.startDate || !record.endDate) return '-'
            return `${record.startDate} → ${record.endDate}`
          }}
        />
        <Resource.Column<BulkReportJob>
          title={I18n.t('shared.files')}
          id="files"
          width={220}
          render={(_: unknown, record: BulkReportJob) => record.filesCount || 0}
        />
      </Resource.Table>
    </Resource>
  )
}

export default BulkReports
