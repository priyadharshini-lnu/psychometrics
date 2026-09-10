import { FC, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Space, Button, Card, Typography, Spin, Flex, Table, Divider, Grid, Checkbox,
} from 'antd'
import { LeftOutlined, DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { formatedDate } from '~/utils/time'
import { getLanguageLabel } from './core'
import { BulkReportJob, BulkReportFile } from './types'

const { Text } = Typography
const { useBreakpoint } = Grid
const { I18n } = window

const SectionLabel: FC<{ label: string; count?: number }> = ({ label, count }) => (
  <Text
    type="secondary"
    style={{
      display: 'block',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: 10,
    }}
  >
    {label}
    {count !== undefined && (
      <span style={{ marginLeft: 6, fontWeight: 400, letterSpacing: 0 }}>
        ·
        {' '}
        {count}
      </span>
    )}
  </Text>
)

const BulkReportJobDetail: FC = () => {
  const { projectId, jobId } = useParams() as { projectId: string; jobId: string }
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const [hasLoadedJob, setHasLoadedJob] = useState(false)

  const {
    data: jobs,
    fetchSingle,
    isLoading,
  } = useResources<BulkReportJob>('bulk_report_jobs', {
    basePath: `projects/${projectId}`,
  })

  useEffect(() => {
    fetchSingle({ id: jobId }).finally(() => setHasLoadedJob(true))
  }, [jobId])

  const job = jobs?.[0] ?? null
  const loading = isLoading(`fetch@${jobId}`) || !hasLoadedJob

  const columns = [
    {
      title: I18n.t('shared.id'),
      key: 'id',
      width: 200,
      render: (_: unknown, file: BulkReportFile) => file.id,
    },
    {
      title: I18n.t('shared.filename'),
      key: 'filename',
      render: (_: unknown, file: BulkReportFile) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{file.filename || '-'}</Text>
      ),
    },
    {
      title: I18n.t('shared.actions'),
      key: 'actions',
      width: 180,
      render: (_: unknown, file: BulkReportFile) => (
        <Button
          type="primary"
          size="small"
          icon={<DownloadOutlined />}
          href={file.url ?? undefined}
          target="_blank"
          disabled={!file.url}
        >
          {I18n.t('shared.download')}
        </Button>
      ),
    },
  ]

  if (loading) {
    return (
      <Flex justify="center" style={{ padding: 60 }}>
        <Spin />
      </Flex>
    )
  }

  const campaigns = job?.campaigns ?? []
  const reportEntries = Object.entries(job?.selectedReports ?? {})

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Space direction="vertical" size={12} style={{ width: '100%', padding: '16px' }}>
        <Button
          type="text"
          style={{ padding: 0, alignSelf: 'flex-start' }}
          icon={<LeftOutlined />}
          onClick={() => navigate(`/admin/projects/${projectId}/bulk_reports`)}
        >
          {I18n.t('shared.back')}
        </Button>

        <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '12px 24px',
              marginBottom: 20,
            }}
          >
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{I18n.t('shared.id')}</Text>
              <div><Text strong>{job?.id || '-'}</Text></div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{I18n.t('shared.status')}</Text>
              <div><Text strong>{job?.status ? I18n.t(`shared.${job.status}`) : '-'}</Text></div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{I18n.t('admin.data_reports_columns_created_at')}</Text>
              <div>
                <Text strong>
                  {job?.createdAt ? formatedDate(job.createdAt) : '-'}
                </Text>
              </div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{I18n.t('admin.bulk_reports_queued_by')}</Text>
              <div><Text strong>{job?.createdBy || '-'}</Text></div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <Card size="small">
              <SectionLabel label={I18n.t('admin.campaigns')} count={campaigns.length} />
              {campaigns.length === 0 ? (
                <Text type="secondary" style={{ fontSize: 13.5 }}>—</Text>
              ) : (
                <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5 }}>
                    {campaigns.map(c => (
                      <li key={c.id} style={{ marginBottom: 3 }}>
                        <Text style={{ fontSize: 13.5 }}>{c.name}</Text>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card size="small">
              <SectionLabel label={I18n.t('admin.date_range')} />
              {job?.startDate && job?.endDate ? (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5 }}>
                  <li>
                    <Text style={{ fontFamily: 'monospace', fontSize: 13.5 }}>
                      {job.startDate}
                      {' →'}
                      {job.endDate}
                    </Text>
                  </li>
                </ul>
              ) : (
                <Text type="secondary" style={{ fontSize: 13.5 }}>—</Text>
              )}
            </Card>
          </div>

          <Card size="small" style={{ gridColumn: '1 / -1' }}>
            <SectionLabel
              label={I18n.t('admin.bulk_reports_reports_and_languages')}
              count={reportEntries.length}
            />
            {reportEntries.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 13.5 }}>—</Text>
            ) : (
              <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                {reportEntries.map(([reportId, report], idx) => (
                  <div key={reportId}>
                    {idx > 0 && <Divider style={{ margin: '8px 0' }} />}
                    {isMobile ? (
                      <div>
                        <Text strong style={{ fontSize: 13.5, display: 'block' }}>
                          {report.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13, marginTop: 2, display: 'block' }}>
                          {report.locales.map(l => getLanguageLabel(l)).join(', ')}
                        </Text>
                      </div>
                    ) : (
                      <Flex justify="space-between" align="baseline" gap={16}>
                        <Text strong style={{ fontSize: 13.5, flexShrink: 0 }}>
                          {report.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13.5, textAlign: 'right' }}>
                          {report.locales.map(l => getLanguageLabel(l)).join(', ')}
                        </Text>
                      </Flex>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Checkbox
            checked={job?.includeInactiveUsers ?? false}
            disabled
            style={{ marginTop: 12 }}
          >
            {I18n.t('user.modals.exports.include_inactive_users')}
          </Checkbox>
        </Card>
      </Space>

      {job?.errorMessages?.length ? (
        <div style={{ padding: '0 16px' }}>
          <Card size="small">
            <Space direction="vertical" size={6} style={{ width: '100%', textAlign: 'center' }}>
              {job.errorMessages.map(msg => (
                <Text key={msg} type="danger">{msg}</Text>
              ))}
            </Space>
          </Card>
        </div>
      ) : (
        <Table<BulkReportFile>
          dataSource={job?.files || []}
          columns={columns}
          rowKey="id"
          pagination={false}
          style={{ padding: '16px 0' }}
          locale={{
            emptyText: (
              <Text type="secondary">
                {job?.status === 'completed'
                  ? I18n.t('admin.bulk_reports_no_files_yet')
                  : I18n.t('admin.bulk_reports_files_pending')}
              </Text>
            ),
          }}
        />
      )}
    </Space>
  )
}

export default BulkReportJobDetail
