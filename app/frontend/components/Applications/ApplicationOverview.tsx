import React from 'react'
import { Descriptions, Switch } from 'antd'
import type { DescriptionsProps } from 'antd'
import { Application } from '~/modules/admin/modules/client/core/applications'

const { I18n } = window

type Props = {
  application: Application
  isTogglingStatus: boolean
  onToggleDisabled: (checked: boolean) => void
}

export const ApplicationOverview: React.FC<Props> = ({
  application,
  isTogglingStatus,
  onToggleDisabled,
}) => {
  const baseItems: DescriptionsProps['items'] = [
    { key: 'id', label: I18n.t('shared.id'), children: application.id },
    { key: 'name', label: I18n.t('admin.application_name'), children: application.name },
    {
      key: 'status',
      label: I18n.t('shared.status'),
      children: (
        <Switch
          checked={!application.disabled}
          loading={isTogglingStatus}
          onChange={onToggleDisabled}
        />
      ),
    },
    { key: 'client', label: I18n.t('shared.client'), children: application.clientName ?? '—' },
    { key: 'email', label: I18n.t('shared.email'), children: application.email ?? '—' },
    { key: 'created_at', label: I18n.t('shared.created_at'), children: application.createdAt ?? '—' },
    { key: 'created_by', label: I18n.t('shared.created_by'), children: application.createdBy ?? '—' },
    { key: 'updated_at', label: I18n.t('shared.updated_at'), children: application.updatedAt ?? '—' },
    { key: 'updated_by', label: I18n.t('shared.updated_by'), children: application.updatedBy ?? '—' },
  ]

  return (
    <div className="pl">
      <Descriptions
        bordered
        column={1}
        items={baseItems}
        styles={{
          label: { width: '30%' },
          content: { width: '70%' },
        }}
      />
    </div>
  )
}
