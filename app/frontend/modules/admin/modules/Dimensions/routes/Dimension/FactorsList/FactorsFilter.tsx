import { FC } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Factor } from '~/modules/admin/modules/campaigns/core/factors'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'

type Props = {
    openModal: (modalName: string, modalProps?: unknown) => void
}

const { I18n } = window

export const FactorsFilter: FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<Factor>()

  const tableLoading = resource.isLoading('fetch')

  const handleCreateFactorsModal = () => {
    openModal('FactorsFormModal')
  }

  return (
    <Resource.Filter
      name="filterable_fields"
      placeholder={I18n.t('common.actions.search')}
    >
      <Button type="primary" disabled={tableLoading} onClick={handleCreateFactorsModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
