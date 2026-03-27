import { FC } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Dimension } from '~/modules/admin/modules/client/core/dimensions'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'

type Props = {
    openModal: (modalName: string, modalProps?: unknown) => void
}

const { I18n } = window

export const DimensionsFilter: FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<Dimension>()

  const tableLoading = resource.isLoading('fetch')

  const handleCreateDimensionModal = () => {
    openModal('DimensionsFormModal')
  }

  return (
    <Resource.Filter
      name="filterable_fields"
      placeholder={I18n.t('common.actions.search')}
    >
      <Button type="primary" disabled={tableLoading} onClick={handleCreateDimensionModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
