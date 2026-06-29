import ImportModal from '../PortableDataImport/ImportModal'

const DimensionImportModal = (props) => {
  const translations = {
    cancel: I18n.t('shared.cancel'),
    continue: I18n.t('shared.continue'),
    import: I18n.t('shared.import'),
  }

  return (
    <ImportModal
      title={I18n.t('admin.dimensions_import_modal_import_dimension')}
      validateEndpoint="/administration/dimensions/validate_import"
      importEndpoint="/administration/dimensions/import"
      translations={translations}
      showFileErrorAlert={false}
      {...props}
    />
  )
}

export default DimensionImportModal
