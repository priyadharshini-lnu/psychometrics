import React, { FC, useEffect } from 'react'
import { useResources } from 'hooks/useResources'
import { CountDisplay } from 'components/CountDisplay'
import {
  Row, Col, Table, Input, Space, Pagination, Button, Menu, Modal,
} from 'antd'
import { Client, ClientTR } from 'modules/admin/modules/client/core/clients'
import _ from 'lodash'
import Modals from 'modules/admin/components/Modals'
import { PlusOutlined } from '@ant-design/icons'
import { openModal } from 'modules/admin/core/ui/modals'
import { ClientFormModal } from './ClientFormModal'
import { connect, ConnectedProps } from 'react-redux'
import { BaseMeta, RemoveResource, UpdateResource } from 'hooks/useResources/interfaces'
import ConditionalDropdown from 'components/ConditionalDropdown'
import { RemoveClientModal } from './RemoveClientModal'

const { Column } = Table
const { Search } = Input
const { I18n } = window

const MODALS = {
  ClientFormModal,
  RemoveClientModal,
}

const connecter = connect(
  null,
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

const ClientListComponent: FC<Props> = ({ openModal }) => {
  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, changePage,
    currentPage, pageSize, changeFilter, getFilteredValue, updateResource, removeResource, createResource,
  } = useResources<Client, Meta>(
    'clients',
    { trackUrl: true, responseType: ClientTR, apiConfig: { include: ['account_manager', 'project_manager'] } },
  )

  useEffect(() => {
    fetch()
  }, [])

  return (
    <>
      <Row
        justify="space-between"
        align="middle"
        className="pt-4 pb-4 ps-4 pe-4"
      >
        <Col>
          <CountDisplay
            selectedCount={0}
            totalCount={meta.recordCount || 0}
            isLoading={isLoading('fetch')}
          />
        </Col>
        <Col>
          <Space>
            <Search
              placeholder={I18n.t('common.actions.search')}
              value={getFilteredValue('name_cont')}
              onChange={({ target: { value } }) => { changeFilter('name_cont', value) }}
            />
            <Button
                type="primary"
                disabled={isLoading('fetch')}
                onClick={() => openModal('ClientFormModal', { addClient: createResource, types: meta.types, countries: meta.countries })}
              >
              <PlusOutlined />
              {I18n.t('frontend.clients.actions.create.create_client')}
            </Button>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            rowKey={row => row?.id ?? -1}
            dataSource={data}
            pagination={false}
            loading={isLoading('fetch')}
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
              title={I18n.t('administration.clients.columns.account_manager')}
              dataIndex={['accountManager', 'name']}
              key="account_manager"
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
                    ActionsMenu({
                      client,
                      updateResource,
                      removeResource,
                      openModal,
                      meta,
                    }) as React.ReactElement
                  }/>
              )}
            />
          </Table>
        </Col>
      </Row>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={meta.recordCount}
        onChange={changePage}
        className="pl"
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

const ActionsMenu: FC<ActionMenuProps> = ({ client, meta, updateResource, removeResource, openModal }) => {
  const { id, name } = client

  return (
    <Menu>
      <Menu.Item key="edit">
        <div
          role="button"
          tabIndex={-1}
          onClick={() => openModal('ClientFormModal', { updateClient: updateResource, types: meta.types, countries: meta.countries, client }) }>
          {I18n.t('common.actions.edit')}
        </div>
      </Menu.Item>
      <Menu.Item key="remove">
        <div role="button" tabIndex={-1} onClick={() => openModal('RemoveClientModal', { id, name, removeResource })}>
          {I18n.t('common.actions.remove')}
        </div>
      </Menu.Item>
    </Menu>
  )
}

export const ClientList = connecter(ClientListComponent)
