import React from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Application } from '~/modules/admin/modules/client/core/applications'

const { I18n } = window

type Props = {
  openAddModal: () => void
}

export const ApplicationsFilter: React.FC<Props> = ({ openAddModal }) => {
  const { resource } = useResourceContext<Application>()

  return (
    <Resource.Filter name="filterable_fields">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        disabled={resource.isLoading('fetch')}
        onClick={openAddModal}
      >
        {I18n.t('admin.application_add')}
      </Button>
    </Resource.Filter>
  )
}
