import React from 'react'
import { Menu } from 'antd'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSupportAdmin } from '~/core/currentUser'

const { I18n } = window

const AuditLogTabs: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const currentUser = useSelector((state: RootState) => getCurrentUser(state))

  const isHistory = pathname.includes('/record_trace')

  const menuItems = [
    { key: 'logs', label: I18n.t('admin.audit_logs') },
    ...(isSupportAdmin(currentUser)
      ? [{ key: 'record_trace', label: I18n.t('admin.record_history_title') }]
      : []),
  ]

  const onSelect = ({ key }) => {
    navigate(key === 'record_trace' ? '/admin/audit_logs/record_trace' : '/admin/audit_logs')
  }

  return (
    <Menu
      items={menuItems}
      onSelect={onSelect}
      selectedKeys={[isHistory ? 'record_trace' : 'logs']}
      mode="horizontal"
    />
  )
}

export default AuditLogTabs
