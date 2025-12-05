import { AutoComplete, Input } from 'antd'
import { isJsonString } from '~/utils/isJsonString'
import userPresenter from '~/presenters/user'

export default function UserAutocomplete ({
  users, search, onSelect, url, placeholder, source, value, onChange, searchOnChange = false,
}) {
  const handleChange = (value) => {
    if (isJsonString(value)) {
      return
    }

    if (onChange) {
      onChange(value)
    }
    // Search as user types only if searchOnChange is enabled
    if (searchOnChange && value && value.length > 0) {
      search(url, source, value)
    }
  }

  return (
    <AutoComplete
      options={users.map(user => ({
        value: JSON.stringify(user),
        label: userPresenter.getFullNameWithEmail(user),
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
