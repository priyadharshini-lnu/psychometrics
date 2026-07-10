import React from 'react'
import { Switch } from 'antd'
import { Link } from 'react-router-dom'
import { FilterValue } from 'antd/es/table/interface'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Application } from '~/modules/admin/modules/client/core/applications'
import { ApplicationStatusSwitch } from './ApplicationStatusSwitch'

const { I18n } = window

export const ApplicationsTable: React.FC = () => {
  const { resource } = useResourceContext<Application>()

  return (
    <Resource.Table pagination>
      <Resource.Column<Application>
        title={I18n.t('shared.id')}
        id="id"
        dataIndex="id"
        sorter
        render={(id: string) => <Link to={id}>{id}</Link>}
      />
      <Resource.Column<Application>
        title={I18n.t('shared.name')}
        id="name"
        sorter
      />
      <Resource.Column<Application>
        title={I18n.t('shared.status')}
        id="disabled"
        dataIndex="disabled"
        filterMultiple={false}
        filters={[
          { text: I18n.t('shared.active'), value: 'false' },
          { text: I18n.t('shared.inactive'), value: 'true' },
        ]}
        filteredValue={resource.getFilteredValue('disabled_in') as FilterValue | undefined}
        render={(_disabled: boolean, record: Application) => (
          <ApplicationStatusSwitch record={record} />
        )}
      />
      <Resource.Column<Application>
        title={I18n.t('admin.has_api_keys')}
        id="has_api_keys"
        dataIndex="hasApiKeys"
        render={(hasApiKeys: boolean) => <Switch disabled checked={hasApiKeys} />}
      />
      <Resource.Column<Application>
        title={I18n.t('admin.has_public_keys')}
        id="has_public_keys"
        dataIndex="hasPublicKeys"
        render={(hasPublicKeys: boolean) => <Switch disabled checked={hasPublicKeys} />}
      />
      <Resource.Column<Application>
        title={I18n.t('shared.created_at')}
        id="created_at"
        dataIndex="createdAt"
        sorter
      />
      <Resource.Column<Application>
        title={I18n.t('shared.updated_at')}
        id="updated_at"
        dataIndex="updatedAt"
        sorter
      />
      <Resource.Column<Application>
        title={I18n.t('shared.created_by')}
        id="created_by"
        dataIndex="createdBy"
      />
    </Resource.Table>
  )
}
