import { FC } from 'react'
import { Button } from 'antd'
import {
  ImportOutlined,
  PlusOutlined,
  TranslationOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
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

  const importFactorsModal = () => {
    openModal('FactorsImportModal')
  }

  const handleTranslationsModal = () => {
    openModal('FactorTranslationsModal')
  }

  return (
    <Resource.Filter
      name="filterable_fields"
      placeholder={I18n.t('shared.search')}
    >
      <Button type="primary" disabled={tableLoading} onClick={handleCreateFactorsModal}>
        <PlusOutlined />
        {I18n.t('shared.create')}
      </Button>
      <Button disabled={tableLoading} onClick={importFactorsModal}>
        <ImportOutlined />
        {I18n.t('admin.dimensions_import_factors_title')}
      </Button>
      <Button disabled={tableLoading} onClick={handleTranslationsModal}>
        <TranslationOutlined />
        {I18n.t('admin.translations.title')}
      </Button>
    </Resource.Filter>
  )
}
