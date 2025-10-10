import { AutoComplete, Input } from 'antd'
import userPresenter from '~/presenters/user'

export default function UserAutocomplete ({
  users, search, onSelect, url, placeholder, source, value, onChange, searchOnChange = false,
}) {
  const handleChange = (value) => {
    onChange(value)
    // Search as user types only if searchOnChange is enabled
    if (searchOnChange && value && value.length > 0) {
      search(url, source, value)
    }
  }

  return (
    <AutoComplete
      dataSource={users.map(user => ({
        value: JSON.stringify(user),
        text: userPresenter.getFullNameWithEmail(user),
      }))}
      autoFocus
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      onSelect={onSelect}
    >
      {searchOnChange ? (
        <Input />
      ) : (
        <Input.Search onSearch={value => search(url, source, value)} />
      )}
    </AutoComplete>
  )
}
