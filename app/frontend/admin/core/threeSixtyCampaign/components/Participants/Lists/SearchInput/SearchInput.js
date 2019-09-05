import { Icon, Input } from 'antd'
import React, { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import routeUtils from 'utils/routeUtils'
import styles from './styles.scss'
import settings from '../../../../settings'

export default function Search ({ onChange: onChangeCallback, path, history }) {
  const page = 1
  const [value, setValue] = useState('')

  const [debouncedCallback] = useDebouncedCallback(name => onChangeCallback(page, name), 700)

  const onChange = ({ currentTarget }) => {
    setValue(currentTarget.value)
    routeUtils.moveTo(history, settings.urlPrefix, `${path}?page=${page}`)
    debouncedCallback(currentTarget.value)
  }

  return (
    <Input
      value={value}
      onChange={onChange}
      placeholder="Search..."
      suffix={<Icon type="search" />}
      className={styles.container}
    />
  )
}
