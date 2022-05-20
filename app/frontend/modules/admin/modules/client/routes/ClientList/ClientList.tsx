import React, { FC, useEffect } from 'react'
import { useResources } from 'hooks/useResources'
import { CountDisplay } from 'components/CountDisplay'
import {
  Row, Col, Table, Input, Space, Pagination, Button,
} from 'antd'
import { Client, ClientTR } from 'modules/admin/modules/client/core/clients'
import _ from 'lodash'
import Modals from 'modules/admin/components/Modals'
import { PlusOutlined } from '@ant-design/icons'
import { openModal } from 'modules/admin/core/ui/modals'
import { ClientFormModal } from './ClientFormModal'
import { connect, ConnectedProps } from 'react-redux'

const { Column } = Table
const { Search } = Input
const { I18n } = window

const MODALS = {
  ClientFormModal
}

const connecter = connect(
  null,
  {
    openModal,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const ClientListComponent: FC<Props> = ({ openModal }) => {
  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, changePage,
    currentPage, pageSize, changeFilter, getFilteredValue, updateResource, createResource,
  } = useResources<Client>(
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
          {/* <button onClick={() => data?.[0]?.id && updateResource({ id: data?.[0]?.id, accountManagerId: '86468', projectManagerIds: ['1'] })}>Update</button> */}
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
                onClick={() => openModal('ClientFormModal', { addClient: createResource })}
              >
              <PlusOutlined />
              Create Client
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

export const ClientList = connecter(ClientListComponent)
