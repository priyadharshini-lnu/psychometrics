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
  const isTenantRepair = pathname.includes('/tenant_repair')

  const menuItems = [
    { key: 'logs', label: I18n.t('admin.audit_logs') },
    ...(isSupportAdmin(currentUser)
      ? [
        { key: 'record_trace', label: I18n.t('admin.record_history_title') },
        { key: 'tenant_repair', label: I18n.t('admin.tenant_repair_title') },
      ]
      : []),
  ]

  const onSelect = ({ key }) => {
    if (key === 'record_trace') navigate('/admin/audit_logs/record_trace')
    else if (key === 'tenant_repair') navigate('/admin/audit_logs/tenant_repair')
    else navigate('/admin/audit_logs')
  }

  const activeKey = (() => {
    if (isTenantRepair) return 'tenant_repair'
    if (isHistory) return 'record_trace'
    return 'logs'
  })()

  return (
    <Menu
      items={menuItems}
      onSelect={onSelect}
      selectedKeys={[activeKey]}
      mode="horizontal"
    />
  )
}

export default AuditLogTabs
