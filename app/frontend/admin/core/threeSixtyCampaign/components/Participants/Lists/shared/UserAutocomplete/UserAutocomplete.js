import React from 'react'
import { AutoComplete, Input } from 'antd'
import userPresenter from 'presenters/userPresenter'

export default function UserAutocomplete ({
  users, search, onSelect, url, placeholder, source,
}) {
  return (
    <AutoComplete
      dataSource={users.map(user => ({
        value: JSON.stringify(user),
        text: userPresenter.getFullNameWithEmail(user),
      }))}
      autoFocus
      placeholder={placeholder}
      onSelect={onSelect}
    >
      <Input.Search onSearch={value => search(url, source, value)} />
    </AutoComplete>
  )
}
