import React, { FC, useEffect } from 'react'
import * as t from 'io-ts'
import { useResources } from 'hooks/useResources'
import { CountDisplay } from 'components/CountDisplay'
import {
  Row, Col, Table, Input, Space, Pagination,
} from 'antd'

const { Column } = Table
const { Search } = Input

type Props = {}

const ResourceIdentifierTR = t.type({
  id: t.string,
  type: t.string,
})

const ClientTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    type: t.string,
    year: t.number,
    country: t.string,
  }),
])
type Client = t.TypeOf<typeof ClientTR>

export const ClientList: FC<Props> = () => {
  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, changePage,
    currentPage, pageSize, changeFilter, getFilteredValue,
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
            totalCount={meta.record_count || 0}
            isLoading={isLoading('fetch')}
          />
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Search"
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
              title="Id"
              dataIndex="id"
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
            />
            <Column
              title="Name"
              dataIndex="name"
              key="name"
              sorter
              sortOrder={getSortOrder('name')}
            />
            <Column
              title="Type"
              dataIndex="type"
              key="type"
            />
            <Column
              title="Country"
              dataIndex="country"
              key="county"
            />
            <Column
              title="Year"
              dataIndex="year"
              key="year"
            />
            <Column
              title="Account Manager"
              dataIndex={['account_manager', 'name']}
              key="account_manager"
            />
            <Column
              title="Project Manager"
              dataIndex={['project_manager', 'name']}
              key="project_manager"
            />
          </Table>
        </Col>
      </Row>
      <Pagination
        hideOnSinglePage
        current={currentPage}
        pageSize={pageSize}
        total={meta.record_count}
        onChange={changePage}
        className="pl"
      />
    </>
  )
}
