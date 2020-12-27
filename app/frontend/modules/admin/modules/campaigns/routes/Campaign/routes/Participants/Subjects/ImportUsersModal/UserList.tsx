import React from 'react'
import { Table } from 'antd'
import { ShortUser as User } from 'modules/admin/modules/campaigns/core/users'

const { I18n } = window

interface OwnProps {
  users: User[]
}

const UserList: React.FC<OwnProps> = ({ users }) => {
  const columns = [
    {
      title: I18n.t('user.fields.first_name'),
      dataIndex: 'firstName',
      key: 'first_name',
    },
    {
      title: I18n.t('user.fields.last_name'),
      dataIndex: 'lastName',
      key: 'last_name',
    },
    {
      title: I18n.t('user.fields.email'),
      dataIndex: 'email',
      key: 'email',
    },
  ]

  return <Table rowKey="email" dataSource={users} columns={columns} pagination={false} />
}

export default UserList
