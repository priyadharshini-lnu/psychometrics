import React from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'

const { I18n } = window

export const OccupationConditionSetsFilter: React.FC<{ openModal: (name: string) => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter hideSearch name="filterable_fields">
      <Button type="primary" disabled={tableLoading} onClick={() => openModal('OccupationConditionSetsFormModal')}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
