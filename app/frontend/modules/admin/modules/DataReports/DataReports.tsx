import React, { useState } from 'react'
import {
  Button, message, Space,
} from 'antd'
import { Link } from 'react-router-dom'
import { PlusOutlined, EditOutlined, CaretRightOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import {
  DataReport,
  DataReportTR,
  OkResponse,
} from './core'
import { DataReportForm } from './DataReportForm'
import { formatedDate } from '~/utils/time'
import { Resource } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'
import RunReportModal from './components/RunReportModal'

const { I18n } = window

export const DataReports: React.FC<{}> = () => {
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

  const { memberAction, fetchSingle } = useResources<DataReport>(
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
    <Resource.Filter hideSearch name="filterable_fields">
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
        width={150}
        render={({ id, scope }) => (
          scope === 'global' ? (
            <Link to={`/admin/data_reports/${id}`}>{id}</Link>
          ) : (
            id
          )
        )}
      />
      <Resource.Column<DataReport>
        id="name"
        title={I18n.t('shared.name')}
        dataIndex="name"
        key="campaign_name"
        width={300}
      />
      <Resource.Column<DataReport>
        id="report_type"
        title={I18n.t('admin.report_type')}
        dataIndex="reportType"
        width={200}
        render={reportType => I18n.t(`admin.report_types.${reportType}`)}
      />
      <Resource.Column<DataReport>
        id="scope"
        title={I18n.t('admin.scope')}
        dataIndex="scope"
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
    <Resource config={config} name="data_reports">
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
