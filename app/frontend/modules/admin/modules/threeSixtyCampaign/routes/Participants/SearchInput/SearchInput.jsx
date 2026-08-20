import { Input } from 'antd'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useNavigate } from 'react-router-dom'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import routeUtils from '~/utils/route'
import styles from './styles.less'
import settings from '../../../settings'

const { I18n } = window

export default function Search ({
  onChange: onChangeCallback, path, searchTerm, style,
}) {
  const navigate = useNavigate()
  const page = 1
  const [value, setValue] = useState(searchTerm)

  const debouncedCallback = useDebouncedCallback(name => onChangeCallback(page, name), 700)

  const onChange = ({ currentTarget }) => {
    setValue(currentTarget.value)
    routeUtils.moveTo(navigate, settings.urlPrefix, `${path}?page=${page}&search=${currentTarget.value}`)
    debouncedCallback(currentTarget.value)
  }

  return (
    <Input
      value={value}
      onChange={onChange}
      placeholder={I18n.t('common.actions.search')}
      suffix={<SearchOutlined />}
      className={styles.container}
      style={{ ...style }}
    />
  )
}
