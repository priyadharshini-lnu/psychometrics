import React from 'react'
import { Alert, Space } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import _ from 'lodash'
import { RootState } from '../core/reducers'

const FLASH_TYPES = {
  success: 'success', error: 'error', notice: 'info', alert: 'warning',
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {
  className?: string
}

const connector = connect((state: RootState) => ({
  flash: state.flash,
}), {})

const FlashComponent: React.FC<Props> = ({ className, flash }) => {
  if (!flash.length) { return null }
  return (
    <div className={className}>
      <Space orientation="vertical" className="w-100">
        {flash.map((item, i) => (
          FLASH_TYPES[item.type] && !_.isEmpty(item.value) && (
            <Alert message={item.value} type={FLASH_TYPES[item.type]} key={i} />
          )
        ))}
      </Space>
    </div>
  )
}

export const Flash = connector(FlashComponent)
