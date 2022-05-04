import React, { FC, useEffect, useState } from 'react'
import * as t from 'io-ts'
import { atom, AtomOptions, RecoilState, useRecoilState } from 'recoil'
import { LoadingOutlined } from '@ant-design/icons'
import { useResources, ResourceState } from 'hooks/useResources'
import { CountDisplay } from 'components/CountDisplay'
import { Row, Col, Table, Input, Space } from 'antd'

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
  default: { data: [], requests: {} },
});


export const ClientList: FC<Props> = () => {
  // const [clients, setClients] = useRecoilState<ResourceState<Client[]>>(clientAtom)
  const { data, meta, fetch, updateResource, isLoading, requests } = useResources<Client>(
    'clients', { responseType: ClientTR, apiConfig: { include: ['account_manager'], sort: ['name'] } }
  )

  useEffect(() => {
    fetch()
  }, [])

  return (
    <div>
      {isLoading('update', '100') && <LoadingOutlined />}
      <button onClick={() => {
        updateResource({ id: '100', name:  Math.random().toString(36).substring(2, 15) })
      }}>Update</button>

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
              value={""}
              onChange={() => {}}
            />
            {/* <CreateCampaignDropdown
              openModal={openModal}
              projectId={projectId}
            /> */}
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
          >
            <Column
              title={"Id"}
              dataIndex="id"
              key="id"
              sorter
            />
            <Column
              title={"Name"}
              dataIndex="name"
              key="Name"
              sorter
            />
            <Column
              title={"Country"}
              dataIndex="country"
              key="county"
              sorter
            />
          </Table>
        </Col>
      </Row>
    </div>
  )
}

