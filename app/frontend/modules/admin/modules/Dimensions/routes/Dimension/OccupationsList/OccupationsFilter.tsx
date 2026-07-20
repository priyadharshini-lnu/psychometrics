import { FC } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Occupation } from '~/modules/admin/modules/campaigns/core/occupations'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ToolsDropdown } from './ToolsDropdown'

type Props = {
    openModal: (modalName: string, modalProps?: unknown) => void
}

const { I18n } = window

export const OccupationsFilter: FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<Occupation>()

  const tableLoading = resource.isLoading('fetch')

  const handleCreateOccupationModal = () => {
    openModal('OccupationsFormModal')
  }

  return (
    <Resource.Filter
      name="filterable_fields"
      placeholder={I18n.t('common.actions.search')}
    >
      <ToolsDropdown />
      <Button type="primary" disabled={tableLoading} onClick={handleCreateOccupationModal}>
        <PlusOutlined />
        {I18n.t('common.actions.create')}
      </Button>
    </Resource.Filter>
  )
}
