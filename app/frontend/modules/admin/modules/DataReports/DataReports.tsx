import React, { useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { DataReport, DataReportTR } from './core'
import { DataReportForm } from './DataReportForm'
import { formatedDate } from '~/utils/time'
import { Resource } from '~/modules/admin/components/Resource'

const { I18n } = window

export const DataReports: React.FC<{}> = () => {
  const [showForm, setShowForm] = useState(false)
  const [editable, setEditable] = useState<DataReport | undefined>(undefined)

  const baseApiConfig = {
    include: ['last_updated_by', 'owner'],
    fields: {
      users: ['name', 'email'],
      clients: ['name'],
    },
  }

  const edit = (resource) => {
    setEditable(resource)
    setShowForm(true)
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
      />
      <Resource.Column<DataReport>
        id="name"
        title={I18n.t('shared.name')}
        dataIndex="name"
        key="campaign_name"
        width={300}
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
          <Button type="primary" icon={<EditOutlined />} onClick={() => edit(resource)}>
            {(I18n.t('shared.edit'))}
          </Button>
        )}
        fixed="right"
        width={100}
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
    </Resource>
  )
}

export default DataReports
