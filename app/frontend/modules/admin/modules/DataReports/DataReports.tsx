import React, { useState } from 'react'
import {
  Button, Space, useApp,
} from '@thetalententerprise/glint'
import { Link } from 'react-router-dom'
import { PlusOutlined, EditOutlined, CaretRightOutlined } from '@thetalententerprise/glint/icons'
import {
  DataReport,
  DataReportTR,
  OkResponse,
} from './core'
import { DataReportForm } from './DataReportForm'
import { formatedDate } from '~/utils/time'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { useResources } from '~/hooks/useResources'
import RunReportModal from './components/RunReportModal'
import { REPORT_TYPE_KEYS } from './components/ReportTypeConfigs'

const { I18n } = window

const SCOPE_OPTIONS = ['client', 'global']

export const DataReports: React.FC<{}> = () => {
  const { message } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editable, setEditable] = useState<DataReport | undefined>(undefined)
  const [runTarget, setRunTarget] = useState<DataReport | undefined>(undefined)
  const [runLoading, setRunLoading] = useState(false)

  const baseApiConfig = {
    include: ['last_updated_by', 'owner'],
    fields: {
      users: ['name', 'email'],
      clients: ['name'],
    },
    sort: '-id',
  }

  const { memberAction, fetchSingle, getFilteredValue } = useResources<DataReport>(
    'data_reports',
    {
      trackUrl: true,
      responseType: DataReportTR,
      apiConfig: baseApiConfig,
    },
  )

  const edit = (resource: DataReport) => {
    fetchSingle({ id: resource.id, responseType: DataReportTR, apiConfig: baseApiConfig })
      .then((latestResource) => {
        const latestDataReport = latestResource as DataReport
        setEditable(latestDataReport)
        setShowForm(true)
      })
      .catch(() => {
        setEditable(resource)
        setShowForm(true)
      })
  }

  const runReport = (resource: DataReport) => {
    memberAction({
      id: resource.id,
      action: 'run',
      method: 'post',
      responseType: OkResponse,
    }).then(() => {
      message.info(I18n.t('admin.data_reports_messages_runed'))
    })
  }

  const handleRunClick = (resource: DataReport) => {
    if (!resource.runtimeParametersEnabled) {
      runReport(resource)
      return
    }

    setRunTarget(resource)
  }

  const handleRunSubmit = (runtimeConfiguration: Record<string, string>) => {
    if (!runTarget) return

    setRunLoading(true)

    memberAction({
      id: runTarget.id,
      action: 'run',
      method: 'post',
      responseType: OkResponse,
      body: {
        data: {
          attributes: {
            runtime_configuration: runtimeConfiguration,
          },
        },
      },
    })
      .then(() => {
        message.info(I18n.t('admin.data_reports_messages_runed'))
        setRunTarget(undefined)
      })
      .finally(() => {
        setRunLoading(false)
      })
  }

  const closeForm = () => {
    setEditable(undefined)
    setShowForm(false)
  }

  const config = {
    trackUrl: true,
    responseType: DataReportTR,
    apiConfig: baseApiConfig,
  }

  const Filter = (
    <Resource.Filter
      name="filterable_fields"
      placeholder={I18n.t('shared.search')}
    >
      <Button type="primary" onClick={() => setShowForm(true)}>
        <PlusOutlined />
        {I18n.t('assessments.create')}
      </Button>
    </Resource.Filter>
  )

  const Table = (
    <Resource.Table pagination>
      <Resource.Column<DataReport>
        id="id"
        title={I18n.t('shared.id')}
        sorter
        hideable={false}
        width={150}
        render={({ id, scope }) => (
          scope === 'global' ? (
            <Link to={`/admin/data_reports/${id}`}>{id}</Link>
          ) : (
            id
          )
        )}
        fixed="left"
      />
      <Resource.Column<DataReport>
        id="name"
        title={I18n.t('shared.name')}
        dataIndex="name"
        key="campaign_name"
        width={300}
        fixed="left"
      />
      <Resource.Column<DataReport>
        id="report_type"
        title={I18n.t('admin.report_type')}
        dataIndex="reportType"
        width={200}
        filters={REPORT_TYPE_KEYS.map(value => ({
          text: I18n.t(`admin.report_types.${value}`),
          value,
        }))}
        filteredValue={getFilteredValue('report_type_in') as string[] | null}
        render={reportType => I18n.t(`admin.report_types.${reportType}`)}
      />
      <Resource.Column<DataReport>
        id="scope"
        title={I18n.t('admin.scope')}
        dataIndex="scope"
        filters={SCOPE_OPTIONS.map(value => ({
          text: value === 'global' ? I18n.t('admin.scope_global') : I18n.t('admin.scope_client'),
          value,
        }))}
        filteredValue={getFilteredValue('scope_in') as string[] | null}
        render={scope => (scope === 'global' ? I18n.t('admin.scope_global') : I18n.t('admin.scope_client'))}
        width={100}
      />
      <Resource.Column<DataReport>
        id="owner"
        title={I18n.t('shared.owner')}
        dataIndex={['owner', 'name']}
        key="report_name"
        width={300}
      />
      <Resource.Column<DataReport>
        id="user_email"
        title={I18n.t('admin.data_reports_columns_last_updated_by')}
        dataIndex={['lastUpdatedBy', 'email']}
        key="user_email"
        minWidth={200}
      />
      <Resource.Column<DataReport>
        id="lastUpdateBy"
        title={I18n.t('admin.data_reports_columns_udpated_at')}
        dataIndex={['updatedAt']}
        render={text => formatedDate(text)}
        key="lastUpdateBy"
        width={150}
      />
      <Resource.Column<DataReport>
        id="actions"
        title={I18n.t('shared.actions')}
        hideable={false}
        key="link"
        render={(_, resource) => (
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={() => edit(resource)}>
              {(I18n.t('admin.report_review_edit'))}
            </Button>
            {resource.scope === 'global' && (
              <Button icon={<CaretRightOutlined />} onClick={() => handleRunClick(resource)}>
                {I18n.t('admin.run')}
              </Button>
            )}
          </Space>
        )}
        fixed="right"
        width={200}
      />
    </Resource.Table>
  )

  return (
    <Resource
      title={I18n.t('admin.data_reports')}
      config={config}
      name="data_reports"
      settingsKey={TABLE_SETTINGS_KEYS.adminDataReports}
    >
      {Filter}
      {Table}
      <DataReportForm
        dataReport={editable}
        show={showForm}
        close={() => closeForm()}
      />
      {runTarget && (
        <RunReportModal
          report={runTarget}
          open
          loading={runLoading}
          onRun={handleRunSubmit}
          onClose={() => setRunTarget(undefined)}
        />
      )}
    </Resource>
  )
}

export default DataReports
