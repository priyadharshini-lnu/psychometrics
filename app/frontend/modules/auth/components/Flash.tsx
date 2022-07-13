import React from 'react'
import { Alert } from 'antd'
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
      {flash.map(item => <Alert message={item.value} type={FLASH_TYPES[item.type]} />)}
    </div>
  )
}
