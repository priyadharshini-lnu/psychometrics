import React from 'react'
import { Icon, Popconfirm } from 'antd'

export default function Confirmation ({
  title, onConfirm, placement, children,
}) {
  return (
    <Popconfirm
      placement={placement || 'topRight'}
      title={title}
      icon={<Icon type="warning" theme="twoTone" style={{ color: '#f55' }} />}
      onConfirm={onConfirm}
    >
      {children}
    </Popconfirm>
  )
}
