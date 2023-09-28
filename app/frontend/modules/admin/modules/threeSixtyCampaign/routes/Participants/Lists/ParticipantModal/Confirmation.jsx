import { Popconfirm } from 'antd'
import { WarningOutlined } from '@ant-design/icons'

export default function Confirmation ({
  title, onConfirm, placement, children,
}) {
  return (
    <Popconfirm
      placement={placement || 'topRight'}
      title={title}
      icon={<WarningOutlined theme="twoTone" style={{ color: '#f55' }} />}
      onConfirm={onConfirm}
    >
      {children}
    </Popconfirm>
  )
}
