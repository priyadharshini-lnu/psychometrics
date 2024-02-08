import React from 'react'
import { Alert } from 'antd'
import _ from 'lodash'

interface Props {
  flash: {type:string, value: string}[]
  className?: string
}

const FLASH_TYPES = {
  success: 'success', error: 'danger', notice: 'info', alert: 'warning',
}

export const Flash: React.FC<Props> = ({
  className, flash,
}) => {
  if (!flash.length) { return null }

  return (
    <div className={className}>
      {flash.map((item, i) => (
        FLASH_TYPES[item.type] && !_.isEmpty(item.value)
          && <Alert message={item.value} type={FLASH_TYPES[item.type]} key={i} />))}
    </div>
  )
}
