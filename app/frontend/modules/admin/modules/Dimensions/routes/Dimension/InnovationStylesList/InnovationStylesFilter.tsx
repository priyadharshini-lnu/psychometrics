import { FC } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { InnovationStyles } from '~/modules/admin/modules/campaigns/core/innovationStyles'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'

type Props = {
    openModal: (modalName: string, modalProps?: unknown) => void
}

const { I18n } = window

export const InnovationStylesFilter: FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<InnovationStyles>()

  const tableLoading = resource.isLoading('fetch')

  const handleCreateInnovationStylesModal = () => {
    openModal('InnovationStylesFormModal')
  }

  return (
    <Resource.Filter
      name="filterable_fields"
      placeholder={I18n.t('common.actions.search')}
    >
      <Button type="primary" disabled={tableLoading} onClick={handleCreateInnovationStylesModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
