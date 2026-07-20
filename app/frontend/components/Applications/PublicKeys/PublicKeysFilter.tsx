import React from 'react'
import { Button } from 'antd'
import { PlusOutlined, ThunderboltOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { PublicKey } from '~/modules/admin/modules/client/core/publicKeys'

const { I18n } = window

type FilterProps = {
  onAddClick: () => void
  onGenerateClick: () => void
}

export const PublicKeysFilter: React.FC<FilterProps> = ({ onAddClick, onGenerateClick }) => {
  const { resource } = useResourceContext<PublicKey>()

  return (
    <Resource.Filter hideSearch name="filterable_fields">
      <Button
        onClick={onGenerateClick}
        disabled={resource.isLoading('fetch')}
        icon={<ThunderboltOutlined />}
      >
        {I18n.t('admin.public_key_generate')}
      </Button>
      <Button
        type="primary"
        onClick={onAddClick}
        disabled={resource.isLoading('fetch')}
        icon={<PlusOutlined />}
      >
        {I18n.t('admin.public_key_add')}
      </Button>
    </Resource.Filter>
  )
}
