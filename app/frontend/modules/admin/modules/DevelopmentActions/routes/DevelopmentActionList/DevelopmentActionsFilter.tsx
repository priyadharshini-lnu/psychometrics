import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'

const { I18n } = window

export const DevelopmentActionsFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter name="search_query">

      <Button type="primary" disabled={tableLoading} onClick={openModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
