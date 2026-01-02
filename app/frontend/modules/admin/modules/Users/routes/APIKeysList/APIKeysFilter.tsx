import React from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'

const { I18n } = window

export const APIKeysFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter hideSearch name="filterable_fields">

      <Button type="primary" disabled={tableLoading} onClick={openModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
