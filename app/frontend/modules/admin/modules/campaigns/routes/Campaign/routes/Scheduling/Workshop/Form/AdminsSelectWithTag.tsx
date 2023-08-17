import _ from 'lodash'
import {
  AutoComplete, Row, List,
} from 'antd'
import * as t from 'io-ts'
import React, { useState } from 'react'
import { UserInfoCard } from '~/glint/components/UserInfoCard'

const UserTR = t.type({
  id: t.string,
  name: t.string,
  photoUrl: t.union([t.null, t.string]),
  email: t.string,
})

type User = t.TypeOf<typeof UserTR>

interface AdminSelectProps {
  options: User[]
  onChange: (selectedValues: string[]) => void
  onSearch: (value: string) => void
}

export const AdminsSelectWithTag: React.FC<AdminSelectProps> = ({ onChange, onSearch, options }) => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const handleUserSelect = (userId: string) => {
    const selectedUser = options.find(user => user.id === userId)
    if (selectedUser) {
      setSelectedUsers([...selectedUsers, selectedUser])
      onChange(_.map(selectedUsers, 'id'))
    }
  }

  const handleUserRemove = (userId: number) => {
    const newSelectedUsers = selectedUsers.filter(user => user.id !== userId.toString())
    setSelectedUsers(newSelectedUsers)
    onChange(_.map(newSelectedUsers, 'id'))
  }

  return (
    <>
      <AutoComplete
        onSearch={onSearch}
        placeholder="Select Center manager"
        optionFilterProp="children"
        onChange={(values) => {
          handleUserSelect(values)
        }}
        dataSource={options.map(user => ({
          value: user.id,
          key: user.id,
          text: user.name,
        }))}
      />
      <Row>
        {selectedUsers.map(user => (
          <List
            itemLayout="horizontal"
            style={{ marginTop: '16px', marginRight: '10px', overflow: 'auto' }}
          >
            <UserInfoCard
              nameLabel={user.name}
              nameText={user.name}
              id={user.id}
              email={user.email}
              avatarUrl={user.photoUrl || ''}
              onRemove={handleUserRemove}
            />
          </List>
        ))}
      </Row>
    </>
  )
}
