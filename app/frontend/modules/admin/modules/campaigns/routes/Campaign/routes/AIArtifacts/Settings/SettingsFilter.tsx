import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { User } from '~/modules/admin/modules/client/core/users'

const { I18n } = window

type Props = {
  onCreateAIArtifact: () => void
}
export const SettingsFilter: React.FC<Props> = ({ onCreateAIArtifact }) => {
  const { resource } = useResourceContext<User>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter
      name="filterable_fields"
    >
      <Button type="primary" disabled={tableLoading} onClick={() => onCreateAIArtifact()}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
