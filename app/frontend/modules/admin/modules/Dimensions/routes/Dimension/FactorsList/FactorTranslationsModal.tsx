import React from 'react'
import { message } from 'antd'
import * as t from 'io-ts'
import { useParams } from 'react-router-dom'
import ImportModal from '~/modules/admin/modules/PortableDataImport/ImportModal'
import { useResources } from '~/hooks/useResources'
import { Dimension, DimensionTR } from '~/modules/admin/modules/client/core/dimensions'

type Props = {
  close: () => void
}

const { I18n } = window
const ExportTranslationsResponseTR = t.type({ status: t.string })

export const FactorTranslationsModal: React.FC<Props> = ({ close }) => {
  const { dimensionId } = useParams() as { dimensionId: string }
  const {
    fetchSingle,
    getResource,
    memberAction,
    uploadFileAction,
  } = useResources<Dimension>('dimensions', {
    responseType: DimensionTR,
    apiConfig: { include: ['owner'] },
  })
  const dimension = getResource(dimensionId)

  React.useEffect(() => {
    if (!dimensionId || dimension) return

    fetchSingle({ id: dimensionId })
  }, [dimensionId, dimension, fetchSingle])

  const submitFileImport = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return uploadFileAction(`dimensions/${dimensionId}/import_translations`, formData)
  }

  const handleExportAll = async () => {
    try {
      await memberAction({
        id: dimensionId,
        action: 'export_translations',
        method: 'post',
        responseType: ExportTranslationsResponseTR,
      })
      message.success(I18n.t('admin.dimension_translations_export_scheduled', { name: dimension?.name }))
      close()
    } catch (_error) {
      message.error(I18n.t('admin.errors_error_msg'))
    }
  }

  return (
    <ImportModal
      title={I18n.t('admin.dimensions_translations_header')}
      validateEndpoint=""
      importEndpoint=""
      translations={{
        cancel: I18n.t('shared.close'),
        import: I18n.t('shared.import'),
      }}
      fileLabel={I18n.t('admin.translations.import')}
      fileErrorMessage={I18n.t('admin.errors_csv_file_import')}
      fileAccept=".csv,.xlsx,.xls"
      showMappableFields={false}
      skipValidation
      submitFileImport={submitFileImport}
      successMessage={I18n.t('admin.dimensions_import_modal_import_scheduled')}
      topActionLabel={I18n.t('admin.dimensions_translations_export')}
      onTopAction={handleExportAll}
      onClose={close}
    />
  )
}
