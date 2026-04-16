import ImportModal from '../PortableDataImport/ImportModal'

const DimensionImportModal = (props) => {
  const translations = {
    cancel: I18n.t('administration.dimensions.import_modal.cancel'),
    continue: I18n.t('administration.dimensions.import_modal.continue'),
    import: I18n.t('administration.dimensions.import_modal.import'),
  }

  return (
    <ImportModal
      title={I18n.t('administration.dimensions.import_modal.import_dimension')}
      validateEndpoint="/administration/dimensions/validate_import"
      importEndpoint="/administration/dimensions/import"
      translations={translations}
      showFileErrorAlert={false}
      {...props}
    />
  )
}

export default DimensionImportModal
