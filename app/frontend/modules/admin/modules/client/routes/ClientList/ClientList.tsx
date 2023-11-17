import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import {
  Table, Input, Space, Pagination, Button, MenuProps,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { Client, ClientTR } from '~/modules/admin/modules/client/core/clients'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { BaseMeta, RemoveResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { RootState } from '~/modules/admin/core/rootReducers'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { RemoveClientModal } from './RemoveClientModal'
import { ClientFormModal } from './ClientFormModal'

const { Column } = Table
const { Search } = Input
const { I18n } = window

const MODALS = {
  ClientFormModal,
  RemoveClientModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux
interface Meta extends BaseMeta{
  countries: string[]
  types: string[]
}

const ClientListComponent: React.FC<Props> = ({ openModal, currentUser }) => {
  const [countries, setCoutries] = useState<Meta['countries']>([])
  const [types, setTypes] = useState<Meta['types']>([])
  const baseApiConfig = {
    include: ['project_manager'],
    fields: { users: ['name', 'email'] },
    include_resource_meta: ['permissions'],
  }
  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, changePage,
    currentPage, pageSize, changeFilter, getFilteredValue, updateResource, removeResource,
    createResource,
    requests,
  } = useResources<Client, Meta>(
    'clients',
    {
      trackUrl: true,
      responseType: ClientTR,
      apiConfig: baseApiConfig,
    },
  )
  useEffect(() => {
    fetch({
      apiConfig: _.merge(baseApiConfig, { include_meta: ['countries', 'types'] }),
    }).then(({ meta }) => {
      setCoutries(meta.countries)
      setTypes(meta.types)
    })
  }, [])
  const tableLoading = isLoading('fetch')

  const ClientTable = (
    <>
      <Table
        rowKey={row => row?.id ?? -1}
        dataSource={data}
        pagination={false}
        loading={tableLoading}
        onChange={handleTableChange}
      >
        <Column
          title={I18n.t('common.column.id')}
          dataIndex="id"
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
        />
        <Column
          title={I18n.t('common.column.name')}
          key="name"
          width={300}
          sorter
          sortOrder={getSortOrder('name')}
          render={({ name, id }) => (
            <Link to={`/admin/clients/${id}/projects`}>{name}</Link>
          )}
        />
        <Column
          title={I18n.t('administration.clients.columns.type')}
          dataIndex="type"
          key="type"
        />
        <Column
          title={I18n.t('administration.clients.columns.country')}
          dataIndex="country"
          key="county"
        />
        <Column
          title={I18n.t('administration.clients.columns.year')}
          dataIndex="year"
          key="year"
          sorter
          sortOrder={getSortOrder('year')}
        />
        <Column
          title={I18n.t('administration.clients.columns.project_manager')}
          dataIndex={['projectManager', 'name']}
          key="project_manager"
        />
        <Column
          title={I18n.t('common.column.action')}
          key="action"
          render={client => (
            <ConditionalDropdown
              menu={
                getActionMenuProps({
                  client,
                  updateResource,
                  removeResource,
                  openModal,
                  countries,
                  types,
                  isSuperAdmin: isSuperAdmin(currentUser),
                })
              }
            />
          )}
        />
      </Table>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={meta.recordCount}
        onChange={changePage}
        className="pl"
      />
    </>
  )

  const Filter = (
    <Space>
      <Search
        placeholder={I18n.t('common.actions.search')}
        value={getFilteredValue('filterable_fields')}
        onChange={({ target: { value } }) => { changeFilter('filterable_fields', value) }}
      />
      {isSuperAdmin(currentUser)
          && (
          <Button
            type="primary"
            disabled={tableLoading}
            onClick={() => {
              openModal('ClientFormModal', { addClient: createResource, types, countries })
            }}
          >
            <PlusOutlined />
            {I18n.t('frontend.clients.actions.create.create_client')}
          </Button>
          )}
    </Space>
  )

  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('administration.clients.tenancies'),
          },
        ]}
      />
      <TableLayout
        table={ClientTable}
        filters={Filter}
        recordCount={meta.recordCount}
        loading={tableLoading}
        requestStatus={requests.fetch?.status}
      />
      <Modals modals={MODALS} />
    </>
  )
}
interface ActionMenuData {
  client: Client
  countries: Meta['countries'],
  types: Meta['types'],
  updateResource: UpdateResource<Client>
  removeResource: RemoveResource
  openModal: (modalName: string, modalProps: unknown) => void
  isSuperAdmin: boolean
}

const getActionMenuProps = ({
  client, countries, types, updateResource, removeResource, openModal, isSuperAdmin,
}: ActionMenuData): MenuProps => {
  const { id, name, meta } = client
  const menuItems = [
    isSuperAdmin && { key: 'edit', label: I18n.t('common.actions.edit') },
    meta.permissions.viewLicenses && {
      key: 'licenses',
      label: (
        <Link to={`/admin/clients/${id}/licenses`}>
          {I18n.t('frontend.clients.actions.menus.view_licenses')}
        </Link>
      ),
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return openModal('ClientFormModal', {
        updateClient: updateResource, types, countries, client,
      })
    }
    if (key === 'remove') {
      return openModal('RemoveClientModal', { id, name, removeResource })
    }
  }

  return ({ items: _.compact(menuItems), onClick: handleMenuClick })
}

export const ClientList = connecter(ClientListComponent)
