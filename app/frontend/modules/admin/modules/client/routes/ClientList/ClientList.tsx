import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import {
  Table, Input, Space, Pagination, Button, MenuProps, Typography,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
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
import { useWindowSize } from '~/hooks/useWindowSize'

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

interface Meta extends BaseMeta {
  countries: string[]
  types: string[]
}

const ClientList: React.FC<Props> = ({
  openModal,
  currentUser,
}) => {
  const [countries, setCoutries] = useState<Meta['countries']>([])
  const [types, setTypes] = useState<Meta['types']>([])
  const { width: windowWidth } = useWindowSize()
  const baseApiConfig = {
    include: ['project_manager'],
    fields: { users: ['name', 'email'] },
    include_resource_meta: ['permissions'],
  }
  const {
    data,
    meta,
    fetch,
    isLoading,
    getSortOrder,
    handleTableChange,
    changePage,
    currentPage,
    pageSize,
    changeFilter,
    getFilteredValue,
    updateResource,
    removeResource,
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
    })
      .then(({ meta }) => {
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
        scroll={{ x: 'max-content' }}
        loading={tableLoading}
        onChange={handleTableChange}
        sticky={{ offsetHeader: 50 }}
      >
        <Column
          title={I18n.t('shared.id')}
          dataIndex="id"
          key="id"
          fixed={windowWidth > 800 ? 'left' : undefined}
          sorter
          sortOrder={getSortOrder('id')}
          width={100}
        />
        <Column
          title={I18n.t('shared.name')}
          key="name"
          width="auto"
          sorter
          sortOrder={getSortOrder('name')}
          render={({
            name,
            id,
            url,
          }: Client) => (
            <Space direction="vertical" size={0}>
              <Link to={`/admin/clients/${id}/projects`}>{name}</Link>
              {url && (
                <Typography.Link
                  href={url}
                  target="_blank"
                  copyable
                >
                  {url}
                </Typography.Link>
              )}
            </Space>
          )}
          minWidth={300}
        />
        <Column
          title={I18n.t('shared.type')}
          dataIndex="type"
          render={(_, client: Client) => I18n.t(`activerecord.attributes.client.types.${client.type}`)}
          key="type"
          minWidth={100}
        />
        <Column
          title={I18n.t('admin.country')}
          dataIndex="country"
          key="county"
          minWidth={100}
        />
        <Column
          title={I18n.t('admin.year')}
          dataIndex="year"
          key="year"
          sorter
          sortOrder={getSortOrder('year')}
          minWidth={100}
        />
        <Column
          title={I18n.t('admin.project_manager')}
          dataIndex={['projectManager', 'name']}
          key="project_manager"
          minWidth={150}
        />
        <Column
          title={I18n.t('shared.action')}
          key="action"
          fixed={windowWidth > 800 ? 'right' : undefined}
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
          width={100}
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
        placeholder={I18n.t('shared.search')}
        value={getFilteredValue('filterable_fields')}
        onChange={({ target: { value } }) => {
          changeFilter('filterable_fields', value)
        }}
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
              {I18n.t('admin.create_client')}
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
            label: () => I18n.t('admin.clients'),
          },
        ]}
      />
      <TableLayout
        table={ClientTable}
        filters={Filter}
        recordCount={meta.recordCount}
        loading={tableLoading}
        requestStatus={requests.fetch?.status}
        failureMsg={getErrorMsgFromJsonApiRequests(requests)}
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
  client,
  countries,
  types,
  updateResource,
  removeResource,
  openModal,
  isSuperAdmin,
}: ActionMenuData): MenuProps => {
  const {
    id,
    name,
    meta,
  } = client
  const menuItems = [
    isSuperAdmin && { key: 'edit', label: I18n.t('shared.edit') },
    meta.permissions.viewLicenses && {
      key: 'licenses',
      label: (
        <Link to={`/admin/clients/${id}/licenses`}>
          {I18n.t('admin.view_licenses')}
        </Link>
      ),
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return openModal('ClientFormModal', {
        updateClient: updateResource,
        types,
        countries,
        client,
      })
    }
    if (key === 'remove') {
      return openModal('RemoveClientModal', {
        id,
        name,
        removeResource,
      })
    }
  }

  return ({
    items: _.compact(menuItems),
    onClick: handleMenuClick,
  })
}

export default connecter(ClientList)
