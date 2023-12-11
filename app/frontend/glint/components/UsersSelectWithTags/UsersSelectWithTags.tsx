import _ from 'lodash'
import { FC, useState, useEffect } from 'react'
import {
  AutoComplete, Space, AutoCompleteProps, Empty,
} from 'antd'
import { useDebouncedCallback } from 'use-debounce'

import { UserDetails } from '~/modules/admin/modules/campaigns/core/workshop'
import { UserInfoCard } from '~/glint'

type UsersSelectWithTagsProps = {
  users: UserDetails[]
  preSelectedUsers: UserDetails[]
  userIdField?: string
  onUserSearch: (searchKey: string) => void
  onChange?: (selectedUserIds: string[]) => void
} & AutoCompleteProps

export const UsersSelectWithTags: FC<UsersSelectWithTagsProps> = ({
  users, onUserSearch, preSelectedUsers, onChange, userIdField = 'id', value, ...props
}) => {
  const [selectedUsers, setSelectedUsers] = useState(preSelectedUsers || [])
  const [searchKey, setSearchKey] = useState('')
  const autoCompleteProps = _.omit(props, ['value'])

  useEffect(() => {
    const valueSelected = value ? value.map(id => users.find(user => user.id === id)) : null
    if (valueSelected) {
      setSelectedUsers(valueSelected)
    }
  }, [value])

  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find(user => user.id === userId)
    if (selectedUser && !_.map(selectedUsers, 'id').includes(userId)) {
      const updatedUsers = [...selectedUsers, selectedUser]
      setSelectedUsers(updatedUsers)
      onChange && onChange(_.map(updatedUsers, userIdField))
    }
    setSearchKey('')
  }

  const handleUserRemove = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter(user => user.id !== userId)
    setSelectedUsers(newSelectedUsers)
    onChange && onChange(_.map(newSelectedUsers, userIdField))
  }

  const debouncedOnUserSearch = useDebouncedCallback((searchKey: string) => {
    onUserSearch(searchKey)
  }, 500)

  const handleUserSearch = (searchKey: string) => {
    setSearchKey(searchKey)
    debouncedOnUserSearch(searchKey)
  }

  return (
    <>
      <AutoComplete
        onBlur={() => setSearchKey('')}
        onSearch={handleUserSearch}
        onSelect={(_, option) => {
          handleUserSelect(option.value ? option.value.toString() : '')
        }}
        options={users.length && searchKey.length ? users.map(user => ({
          value: user.id ? user.id : '',
          label: <UserInfoCard
            key={user.id}
            bordered={false}
            transparent
            nameText={user.fullName}
            nameLabel={user.fullName}
            avatarUrl={user.photoUrl || ''}
            email={user.email}
          />,
        })) : undefined}
        value={searchKey}
        notFoundContent={searchKey ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : null}
        {...autoCompleteProps}
      />
      {selectedUsers.length ? (
        <Space wrap>
          {
            selectedUsers.map(user => (
              <UserInfoCard
                key={user.id}
                bordered
                id={user.id}
                nameText={user.fullName}
                nameLabel={user.fullName}
                avatarUrl={user.photoUrl || ''}
                email={user.email}
                onRemove={handleUserRemove}
              />
            ))
          }
        </Space>
      ) : null}
    </>
  )
}
