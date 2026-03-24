import { FC } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { SubFactors } from '~/modules/admin/modules/client/core/subFactors'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'

type Props = {
    openModal: (modalName: string, modalProps?: unknown) => void
    slug: string
}

const { I18n } = window

export const SubFactorsFilter: FC<Props> = ({
  openModal,
  slug,
}) => {
  const { resource } = useResourceContext<SubFactors>()

  const tableLoading = resource.isLoading('fetch')

  const handleCreateSubFactorsModal = () => {
    openModal('SubFactorsFormModal', { slug })
  }

  return (
    <Resource.Filter
      name="filterable_fields"
      placeholder={I18n.t('common.actions.search')}
    >
      <Button type="primary" disabled={tableLoading} onClick={handleCreateSubFactorsModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
