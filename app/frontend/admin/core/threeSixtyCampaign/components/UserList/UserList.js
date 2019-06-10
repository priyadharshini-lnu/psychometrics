import React from 'react'
import { Table } from 'antd'

export default function UserList ({ dataSource }) {
  if (_.isEmpty(dataSource)) { return null }

  const columns = [
    {
      title: 'First name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'last_name',
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email',
    },
  ];

  return <Table dataSource={dataSource} columns={columns} pagination={false} />

}
