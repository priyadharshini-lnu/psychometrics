import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import routeUtils from '~/utils/route'
import styles from './styles.less'
import settings from '../../../../settings'

export default function Search ({
  onChange: onChangeCallback, path, history, searchTerm,
}) {
  const page = 1
  const [value, setValue] = useState(searchTerm)

  const debouncedCallback = useDebouncedCallback(name => onChangeCallback(page, name), 700)

  const onChange = ({ currentTarget }) => {
    setValue(currentTarget.value)
    routeUtils.moveTo(history, settings.urlPrefix, `${path}?page=${page}&search=${currentTarget.value}`)
    debouncedCallback(currentTarget.value)
  }

  return (
    <Input
      value={value}
      onChange={onChange}
      placeholder="Search..."
      suffix={<SearchOutlined />}
      className={styles.container}
    />
  )
}
