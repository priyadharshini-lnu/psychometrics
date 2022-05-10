import React, { FC, useEffect, useState } from 'react'
import * as t from 'io-ts'
import { atom, AtomOptions, RecoilState, useRecoilState } from 'recoil'
import { LoadingOutlined } from '@ant-design/icons'
import { useResources, ResourceState } from 'hooks/useResources'
import { CountDisplay } from 'components/CountDisplay'
import { Row, Col, Table, Input, Space, Pagination } from 'antd'
import capitalize from 'lodash/capitalize'

const { Column } = Table
const { Search } = Input
const { I18n } = window

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
  })
])
type Client = t.TypeOf<typeof ClientTR>

const clientAtom = atom({
  key: 'Clients',
  default: { data: [], requests: {}, meta: {}, query: {} },
});


const randomName = () => capitalize(Math.random().toString(36).substring(2, 15))

export const ClientList: FC<Props> = () => {
  const [clients, setClients] = useRecoilState<ResourceState<Client[]>>(clientAtom)
  const stateManager = { state: clients, setState: setClients }
  const {
    data, meta, fetch, updateResource, isLoading, getSortOrder,
    handleTableChange, changePage, currentPage, pageSize, changeFilter, getFilteredValue,
  } = useResources<Client>(
    'clients', { trackUrl: true, responseType: ClientTR, apiConfig: { include: ['account_manager', 'project_manager'] } }
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
              onChange={(e) => { changeFilter('name_cont', e.target.value) }}
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
              title={"Id"}
              dataIndex="id"
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
            />
            <Column
              title={"Name"}
              dataIndex="name"
              key="name"
              sorter
              sortOrder={getSortOrder('name')}
            />
            <Column
              title={"Type"}
              dataIndex="type"
              key="type"
            />
            <Column
              title={"Country"}
              dataIndex="country"
              key="county"
            />
            <Column
              title={"Year"}
              dataIndex="year"
              key="year"
            />
            <Column
              title={"Account Manager"}
              dataIndex={["account_manager", "name"]}
              key="account_manager"
            />
            <Column
              title={"Project Manager"}
              dataIndex={["project_manager", "name"]}
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
        className='pl'
      />
    </>
  )
}
