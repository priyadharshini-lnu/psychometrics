import React from 'react'
import { Alert } from 'antd'
import _ from 'lodash'
import styles from './styles.less'

interface Props {
  flash: {type:string, value: string}[]
}

const FLASH_TYPES = {
  success: 'success', error: 'danger', notice: 'info', alert: 'warning',
}

export const Flash: React.FC<Props> = ({
  flash,
}) => {
  if (!flash.length) { return null }
  return (
    <div className={styles.flash}>
      {flash.map((item, i) => (
        FLASH_TYPES[item.type] && !_.isEmpty(item.value)
          && <Alert message={item.value} type={FLASH_TYPES[item.type]} key={i} />))}
    </div>
  )
}
