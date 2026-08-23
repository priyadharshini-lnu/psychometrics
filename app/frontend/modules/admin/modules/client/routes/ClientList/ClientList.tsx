import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import {
  Table, Input, Space, Button, MenuProps, Typography, Image, Avatar, Skeleton, Row, Col,
} from '@thetalententerprise/glint'
import { Add } from '@thetalententerprise/glint/icons'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import styles from './styles.less'
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
        onChange={handleTableChange}
        sticky
      >
        <Column
          title={I18n.t('shared.id')}
          dataIndex="id"
          key="id"
          fixed="left"
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
            logo,
          }: Client) => (
            <div>
              <Row gutter={40} wrap={false}>
                <Col span="4">
                  {
                    logo ? (
                      <Link to={`/admin/clients/${id}/projects`} className={styles.imageLinkWrapper}>
                        <Image
                          src={logo}
                          alt={`${name} logo`}
                          preview={false}
                          className={styles.logoImageStyles}
                          placeholder={<Skeleton.Avatar className={styles.imageSkeleton} shape="square" active />}
                        />
                      </Link>
                    ) : (
                      <Avatar
                        size="large"
                        className={styles.imageAvatarStyles}
                      >
                        {name.substring(0, 2)}
                      </Avatar>
                    )
                  }
                </Col>
                <Col>
                  <Space
                    orientation="vertical"
                  >
                    <Link
                      className={styles.campaignLink}
                      to={`/admin/clients/${id}/projects`}
                    >
                      {name}
                    </Link>
                    <div>
                      {url && (
                        <Typography.Link
                          href={url}
                          target="_blank"
                          copyable
                        >
                          {url}
                        </Typography.Link>
                      )}
                    </div>
                  </Space>
                </Col>
              </Row>
            </div>
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
          fixed="right"
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
              <Add />
              {I18n.t('admin.create_client')}
            </Button>
          )}
    </Space>
  )

  return (
    <>
      <TableLayout
        loading={tableLoading}
        table={ClientTable}
        filters={Filter}
        title={I18n.t('admin.clients')}
        pagination={{
          page: currentPage,
          pageSize,
          total: meta.recordCount ?? 0,
          onChange: changePage,
        }}
        recordCount={meta.recordCount}
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
