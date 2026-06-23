import { Button, message } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { CaretRightOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { DataReport, DataReportTR, OkResponse } from '~/modules/admin/modules/DataReports/core/index'
import { formatedDate } from '~/utils/time'
import { Resource } from '~/modules/admin/components/Resource'

const { I18n } = window

export const DataReports: React.FC<{}> = () => {
  const { clientId } = useParams<{clientId: string}>()

  const baseApiConfig = {
    include: ['last_updated_by', 'owner'],
    fields: { users: ['name', 'email'], clients: ['name'] },
    filter: { owner_id_eq: clientId as string },
  }

  const { memberAction } = useResources<DataReport>(
    'data_reports',
    {
      trackUrl: true,
      responseType: DataReportTR,
      apiConfig: baseApiConfig,
    },
  )

  const runAction = (id) => {
    memberAction({
      id,
      action: 'run',
      method: 'post',
      responseType: OkResponse,
    }).then(() => {
      message.info(I18n.t('admin.data_reports_messages_runed'))
    })
  }

  const config = {
    trackUrl: true,
    responseType: DataReportTR,
    apiConfig: baseApiConfig,
  }

  const Table = (
    <>
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
          title={I18n.t('shared.actions')}
          id="link"
          render={(_, { id }) => (
            <Button type="primary" icon={<CaretRightOutlined />} onClick={() => runAction(id)}>
              {(I18n.t('shared.run'))}
            </Button>
          )}
        />
      </Resource.Table>
    </>
  )

  return (
    <Resource config={config} name="data_reports">
      {Table}
    </Resource>
  )
}
