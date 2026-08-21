import React, { useEffect, useState } from 'react'
import {
  Space, Button, Card, Row, Col, Typography, useApp,
} from '@thetalententerprise/glint'
import { useParams, useNavigate } from 'react-router-dom'
import {
  EyeOutlined, DownloadOutlined, CopyOutlined, LeftOutlined,
} from '@thetalententerprise/glint/icons'
import { useResources } from '~/hooks/useResources'
import {
  DataReportJob, DataReportJobTR, Password, PasswordTR, DataReport, DataReportTR,
} from '~/modules/admin/modules/DataReports/core/index'
import { formatedDate } from '~/utils/time'
import { SelfDestroyText } from '~/glint'
import { Resource } from '~/modules/admin/components/Resource'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

const { I18n } = window

export const DataReportJobs: React.FC<{}> = () => {
  const { id, clientId } = useParams<{id: string, clientId?: string}>()
  const navigate = useNavigate()
  const { message } = useApp()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(clientId ? `/admin/clients/${clientId}/data_reports` : '/admin/data_reports')
    }
  }

  const [passwords, setPasswords] = useState<{ [key: string]: string | null }>({})

  const baseApiConfig: Record<string, unknown> = {
    include: ['created_by'],
    fields: { users: ['name', 'email'] },
    sort: '-created_at',
  }
  if (clientId) {
    baseApiConfig.filter = {
      data_report_owner_id_eq: clientId as string,
    }
  }

  const config = {
    basePath: `/data_reports/${id}/`,
    trackUrl: true,
    responseType: DataReportJobTR,
    apiConfig: baseApiConfig,
  }

  const {
    isLoading, getSortOrder, memberAction,
  } = useResources<DataReportJob>(
    'data_report_jobs',
    config,
  )

  const {
    data: reportData,
    fetchSingle,
  } = useResources<DataReport>(
    'data_reports',
    {
      trackUrl: false,
      responseType: DataReportTR,
      apiConfig: {
        include: ['last_updated_by', 'owner'],
        fields: {
          users: ['name', 'email'],
          clients: ['name'],
        },
      },
    },
  )

  useEffect(() => {
    if (!id) return

    fetchSingle({
      id,
      responseType: DataReportTR,
    })
  }, [id])

  const report = reportData[0]
  let scopeLabel = '-'

  if (report) {
    scopeLabel = report.scope === 'global'
      ? I18n.t('admin.scope_global')
      : I18n.t('admin.scope_client')
  }

  const showPassword = (jobId) => {
    memberAction({
      id: jobId,
      action: 'get_password',
      method: 'get',
      responseType: PasswordTR,
    }).then((response) => {
      const { password } = response as Password
      setPasswords({ [jobId]: password })
    })
  }
  const copyPassword = (jobId) => {
    memberAction({
      id: jobId,
      action: 'get_password',
      method: 'get',
      responseType: PasswordTR,
    }).then(async (response) => {
      const { password } = response as Password

      if (password) {
        await navigator.clipboard.writeText(password)
        message.success('Password copied to clipboard')
      }
    })
  }

  const hidePassword = (jobId) => {
    setPasswords({ ...passwords, [jobId]: null })
  }

  const Table = (
    <Resource.Table pagination>
      <Resource.Column<DataReportJob>
        title={I18n.t('common.column.id')}
        dataIndex="id"
        id="id"
        sorter
        sortOrder={getSortOrder('id')}
      />
      <Resource.Column<DataReportJob>
        title={I18n.t('admin.data_reports_columns_created_at')}
        dataIndex="createdAt"
        render={text => formatedDate(text)}
        id="created_at"
      />
      <Resource.Column<DataReportJob>
        title={I18n.t('admin.data_reports_columns_created_by')}
        dataIndex={['createdBy', 'email']}
        id="created_by"
      />
      <Resource.Column<DataReportJob>
        title={I18n.t('shared.status')}
        dataIndex={['status']}
        id="status"
      />
      <Resource.Column<DataReportJob>
        title={I18n.t('admin.data_reports_columns_password')}
        dataIndex={['password']}
        id="password"
        width={350}
        render={(_, record) => {
          const loading = isLoading(`get/show_password@${record.id}`)
          const password = passwords[record.id]
          return (
            <Space key={record.id}>
              {password ? (
                <SelfDestroyText
                  text={password}
                  onDestroy={() => hidePassword(record.id)}
                />
              ) : (
                <>
                  ************
                  <Button
                    disabled={loading}
                    loading={loading}
                    type="link"
                    icon={<CopyOutlined />}
                    onClick={() => copyPassword(record.id)}
                  />
                  <Button
                    disabled={loading}
                    loading={loading}
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => showPassword(record.id)}
                  />
                </>
              )}
            </Space>
          )
        }}
      />
      <Resource.Column<DataReportJob>
        title={I18n.t('shared.actions')}
        id="link"
        width={200}
        render={(_, { status, file }) => (
          <Button
            target="_blank"
            href={file as string}
            type="primary"
            disabled={status !== 'completed' || !file}
            icon={<DownloadOutlined />}
          >
            {(I18n.t('shared.download'))}
          </Button>
        )}
      />
    </Resource.Table>
  )

  return (
    <>
      {!clientId && (
        <Breadcrumb
          crumbs={[
            {
              link: () => '/admin',
              label: () => I18n.t('admin.dashboard'),
            },
            {
              link: () => '/admin/data_reports',
              label: () => I18n.t('admin.data_reports'),
            },
            {
              label: () => id,
            },
          ]}
        />
      )}
      <Space
        orientation="vertical"
        size={12}
        style={{ width: '100%' }}
      >
        <Space
          orientation="vertical"
          size={12}
          style={{ width: '100%', padding: 16 }}
        >
          <Button
            type="text"
            style={{ padding: 0, alignSelf: 'flex-start' }}
            icon={<LeftOutlined />}
            onClick={handleBack}
          >
            {I18n.t('shared.back')}
          </Button>
          <Card
            style={{ marginBottom: 24 }}
            styles={{ body: { padding: '24px 24px' } }}
          >
            <Row gutter={[32, 24]} align="middle">
              <Col xs={24} sm={12} lg={8}>
                <Typography.Text type="secondary">
                  {I18n.t('shared.name')}
                </Typography.Text>
                <div>
                  <Typography.Text strong>
                    {report?.name || '-'}
                  </Typography.Text>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Typography.Text type="secondary">
                  {I18n.t('admin.report_type')}
                </Typography.Text>
                <div>
                  <Typography.Text strong>
                    {report
                      ? I18n.t(`admin.report_types.${report.reportType}`)
                      : '-'}
                  </Typography.Text>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Typography.Text type="secondary">
                  {I18n.t('admin.scope')}
                </Typography.Text>
                <div>
                  <Typography.Text strong>
                    {scopeLabel}
                  </Typography.Text>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Typography.Text type="secondary">
                  {I18n.t('shared.owner')}
                </Typography.Text>
                <div>
                  <Typography.Text strong>
                    {report?.owner?.name || '-'}
                  </Typography.Text>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Typography.Text type="secondary">
                  {I18n.t('admin.data_reports_columns_last_updated_by')}
                </Typography.Text>
                <div>
                  <Typography.Text strong>
                    {report?.lastUpdatedBy?.email || '-'}
                  </Typography.Text>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Typography.Text type="secondary">
                  {I18n.t('admin.data_reports_columns_udpated_at')}
                </Typography.Text>
                <div>
                  <Typography.Text strong>
                    {report?.updatedAt
                      ? formatedDate(report.updatedAt)
                      : '-'}
                  </Typography.Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Space>
        <Resource config={config} name="data_report_jobs">
          {Table}
        </Resource>
      </Space>
    </>
  )
}
