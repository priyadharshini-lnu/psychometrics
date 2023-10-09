
import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'
import { isSuperAdmin } from '~/core/currentUser'

const { I18n } = window

export const UserFilter: React.FC<{ userTab: string, currentUser: User, openModal: () => void }> = ({
  userTab, currentUser, openModal,
}) => {
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter name="filterable_fields">
      {isSuperAdmin(currentUser) && userTab === 'Users::SuperAdmin'
        && (
          <Button type="primary" disabled={tableLoading} onClick={openModal}>
            <PlusOutlined />
            {I18n.t('users.create_superadmin')}
          </Button>
        )}
      {isSuperAdmin(currentUser) && userTab === 'Users::GlobalAssessors'
        && (
          <Button type="primary" disabled={tableLoading} onClick={openModal}>
            <PlusOutlined />
            {I18n.t('users.create_global_assessor')}
          </Button>
        )}
    </Resource.Filter>
  )
}
