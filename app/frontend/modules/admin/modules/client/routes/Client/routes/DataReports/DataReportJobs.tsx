import React, { useState } from 'react'
import { Space, Button } from 'antd'
import { useParams } from 'react-router-dom'
import { EyeOutlined, DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import {
  DataReportJob, DataReportJobTR, Password, PasswordTR,
} from '~/modules/admin/modules/DataReports/core/index'
import { formatedDate } from '~/utils/time'
import { SelfDestroyText } from '~/glint'
import { Resource } from '~/modules/admin/components/Resource'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

const { I18n } = window

export const DataReportJobs: React.FC<{}> = () => {
  const { id, clientId } = useParams<{id: string, clientId?: string}>()

  const [passwords, setPasswords] = useState<{ [key: string]: string | null }>({})

  const baseApiConfig: Record<string, unknown> = {
    include: ['created_by'],
    fields: { users: ['name', 'email'] },
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
              {password
                ? <SelfDestroyText text={password} onDestroy={() => hidePassword(record.id)} />
                : (
                  <>
                    ************
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
      <Resource config={config} name="data_report_jobs">
        {Table}
      </Resource>
    </>
  )
}
