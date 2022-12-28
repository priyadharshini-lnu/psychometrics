import React, { useEffect } from 'react'
import _ from 'lodash'
import { useResources } from 'hooks/useResources'
import {
  Table, Input, Space, Pagination, Button, Menu,
} from 'antd'
import { Client, ClientTR } from 'modules/admin/modules/client/core/clients'
import Modals from 'modules/admin/components/Modals'
import { PlusOutlined } from '@ant-design/icons'
import { openModal } from 'modules/admin/core/ui/modals'
import { connect, ConnectedProps } from 'react-redux'
import { BaseMeta, RemoveResource, UpdateResource } from 'hooks/useResources/interfaces'
import ConditionalDropdown from 'components/ConditionalDropdown'
import { TableLayout } from 'modules/admin/components/TableLayout'
import { get as getCurrentUser } from 'core/currentUser'
import { RootState } from 'modules/admin/core/rootReducers'
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
  const baseApiConfig = { include: ['project_manager'], fields: { users: ['name', 'email'] } }
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
    fetch({ apiConfig: _.merge(baseApiConfig, { include_meta: ['countries', 'types'] }) })
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
            <a href={`/administration/clients/${id}/projects`}>{name}</a>
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

        {currentUser.role === 'Users::SuperAdmin'
          && (
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={client => (
              <ConditionalDropdown
                menu={
                  ActionsMenu({
                    client,
                    updateResource,
                    removeResource,
                    openModal,
                    meta,
                  }) as React.ReactElement
                }
              />
            )}
          />
          )}
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
        value={getFilteredValue('name_cont')}
        onChange={({ target: { value } }) => { changeFilter('name_cont', value) }}
      />
      {currentUser.role === 'Users::SuperAdmin'
          && (
          <Button
            type="primary"
            disabled={tableLoading}
            onClick={() => {
              openModal('ClientFormModal', { addClient: createResource, types: meta.types, countries: meta.countries })
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
interface ActionMenuProps {
  client: Client
  meta: Meta,
  updateResource: UpdateResource<Client>
  removeResource: RemoveResource
  openModal: (modalName: string, modalProps: unknown) => void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  client, meta, updateResource, removeResource, openModal,
}) => {
  const { id, name } = client
  const menuItems = [
    { key: 'edit', label: I18n.t('common.actions.edit') },
    { key: 'remove', label: I18n.t('common.actions.remove') },
    {
      key: 'licenses',
      label: (
        <a href={`/administration/clients/${id}/licenses`}>
          {I18n.t('frontend.clients.actions.menus.view_licenses')}
        </a>
      ),
    },
  ]
  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return openModal('ClientFormModal', {
        updateClient: updateResource, types: meta.types, countries: meta.countries, client,
      })
    }
    if (key === 'remove') {
      return openModal('RemoveClientModal', { id, name, removeResource })
    }
  }

  return (
    <Menu items={menuItems} onClick={handleMenuClick} />
  )
}

export const ClientList = connecter(ClientListComponent)
