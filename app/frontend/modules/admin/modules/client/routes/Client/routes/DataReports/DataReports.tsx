import React, { useState } from 'react'
import { Button, message } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { CaretRightOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { DataReport, DataReportTR, OkResponse } from '~/modules/admin/modules/DataReports/core'
import { formatedDate } from '~/utils/time'
import { Resource } from '~/modules/admin/components/Resource'
import RunReportModal from '~/modules/admin/modules/DataReports/components/RunReportModal'
import { REPORT_TYPE_KEYS } from '~/modules/admin/modules/DataReports/components/ReportTypeConfigs'

const { I18n } = window


export const DataReports: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>()

  const [runTarget, setRunTarget] = useState<DataReport | undefined>()
  const [runLoading, setRunLoading] = useState(false)

  const baseApiConfig = {
    include: ['last_updated_by', 'owner'],
    fields: {
      users: ['name', 'email'],
      clients: ['name'],
    },
    filter: {
      owner_id_eq: clientId as string,
    },
    sort: '-id',
  }

  const config = {
    trackUrl: true,
    responseType: DataReportTR,
    apiConfig: baseApiConfig,
  }

  const { memberAction, getFilteredValue } = useResources<DataReport>(
    'data_reports',
    config,
  )

  const runReport = (
    resource: DataReport,
    runtimeConfiguration: Record<string, string> = {},
  ) => {
    setRunLoading(true)

    memberAction({
      id: resource.id,
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

  const handleRunClick = (resource: DataReport) => {
    if (!resource.runtimeParametersEnabled) {
      runReport(resource)
      return
    }

    setRunTarget(resource)
  }

  const handleRunSubmit = (values: Record<string, string>) => {
    if (!runTarget) return

    runReport(runTarget, values)
  }

  const Filter = (
    <Resource.Filter
      name="filterable_fields"
      placeholder={I18n.t('shared.search')}
    />
  )

  return (
    <Resource config={config} name="data_reports">
      {Filter}
      <Resource.Table pagination>
        <Resource.Column<DataReport>
          id="id"
          title={I18n.t('shared.id')}
          sorter
          render={({ id }) => <Link to={`/admin/clients/${clientId}/data_reports/${id}`}>{id}</Link>}
        />
        <Resource.Column<DataReport>
          title={I18n.t('shared.name')}
          dataIndex="name"
          id="name"
          width={300}
        />
        <Resource.Column<DataReport>
          title={I18n.t('admin.report_type')}
          dataIndex="reportType"
          id="report_type"
          width={200}
          filters={REPORT_TYPE_KEYS.map(value => ({
            text: I18n.t(`admin.report_types.${value}`),
            value,
          }))}
          filteredValue={getFilteredValue('report_type_in') as string[] | null}
          render={reportType => I18n.t(`admin.report_types.${reportType}`)}
        />
        <Resource.Column<DataReport>
          title={I18n.t('admin.scope')}
          dataIndex="scope"
          id="scope"
          width={100}
          render={scope => (scope === 'global'
            ? I18n.t('admin.scope_global')
            : I18n.t('admin.scope_client'))
          }
        />
        <Resource.Column<DataReport>
          title={I18n.t('shared.owner')}
          dataIndex={['owner', 'name']}
          id="owner_name"
          width={300}
        />
        <Resource.Column<DataReport>
          title={I18n.t('admin.data_reports_columns_last_updated_by')}
          dataIndex={['lastUpdatedBy', 'email']}
          id="updater_name"
        />
        <Resource.Column<DataReport>
          title={I18n.t('admin.data_reports_columns_udpated_at')}
          dataIndex={['updatedAt']}
          render={text => formatedDate(text)}
          id="lastUpdateBy"
        />
        <Resource.Column<DataReport>
          id="actions"
          title={I18n.t('shared.actions')}
          render={(_, resource) => (
            <Button
              type="primary"
              icon={<CaretRightOutlined />}
              onClick={() => handleRunClick(resource)}
            >
              {I18n.t('shared.run')}
            </Button>
          )}
        />
      </Resource.Table>
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
