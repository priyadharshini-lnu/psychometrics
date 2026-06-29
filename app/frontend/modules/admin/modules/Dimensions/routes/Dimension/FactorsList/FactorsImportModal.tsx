import React from 'react'
import { Factor } from '~/modules/admin/modules/campaigns/core/factors'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ImportModal from '~/modules/admin/modules/PortableDataImport/ImportModal'

type Props = {
  close: () => void
}

const { I18n } = window

export const FactorsImportModal: React.FC<Props> = ({ close }) => {
  const { resource } = useResourceContext<Factor>()

  const submitFileImport = (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return resource.uploadFileAction('factors/import', formData)
  }

  return (
    <ImportModal
      title={I18n.t('admin.dimensions_import_factors_title')}
      validateEndpoint=""
      importEndpoint=""
      translations={{
        cancel: I18n.t('shared.close'),
        import: I18n.t('shared.import'),
      }}
      fileAccept=".csv"
      fileLabel={I18n.t('admin.dimensions_import_factors_title')}
      fileErrorMessage={I18n.t('admin.errors_csv_file_required')}
      showMappableFields={false}
      skipValidation
      sampleFilePath="/example_csv/factors.csv"
      sampleFileLabel={I18n.t('admin.dimensions_import_factors_sample_file')}
      successMessage={I18n.t('admin.dimensions_import_modal_import_scheduled')}
      submitFileImport={submitFileImport}
      onClose={close}
    />
  )
}
