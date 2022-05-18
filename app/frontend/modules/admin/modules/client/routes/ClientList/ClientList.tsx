import React, { FC, useEffect } from 'react'
import { useResources } from 'hooks/useResources'
import { CountDisplay } from 'components/CountDisplay'
import {
  Row, Col, Table, Input, Space, Pagination,
} from 'antd'
import { Client, ClientTR } from 'modules/admin/modules/client/core/clients'
import _ from 'lodash'
import { hasOne, hasMany, transformer, relationshipDefinition } from 'libs/jsonApi/schema'
import { Resolve } from 'libs/jsonApi/interfaces'


const { Column } = Table
const { Search } = Input
const { I18n } = window

export const ClientList: FC<{}> = () => {
  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, changePage,
    currentPage, pageSize, changeFilter, getFilteredValue, updateResource
  } = useResources<Client>(
    'clients',
    { trackUrl: true, responseType: ClientTR, apiConfig: { include: ['account_manager', 'project_manager'] } },
  )

  useEffect(() => {
    fetch()
    console.log(relationshipDefinition('clients'))
  }, [])


  // const ClientFormDefinition = {
  //   account_manager_id: hasMany('account_manager', { type: 'users' }),
  //   project_manager_id: hasOne('project_manager', { type: 'users' }),
  // }

  // const A = {
  //   clients: {
  //     type: 'clients',
  //     relationships: {
  //       account_manager: {
  //         type: 'users',
  //       }
  //     }
  //   }
  // }

  // const defineResourceSchema = (resourceName, schema: any) => {
  //   let resource = {
  //     type: resourceName,
  //   }
  // }

  // const value = { account_manager_id: '10', a: 1, project_manager_id: '10' }
  // const formData = transformer(ClientFormDefinition, value)
  // type FormData = Resolve<typeof value, typeof ClientFormDefinition>

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
          <button onClick={() => data?.[0]?.id && updateResource({ id: data?.[0]?.id, accountManager: { id: '86468'}})}>Update</button>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder={I18n.t('common.actions.search')}
              value={getFilteredValue('name_cont')}
              onChange={({ target: { value } }) => { changeFilter('name_cont', value) }}
            />
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
    </>
  )
}
