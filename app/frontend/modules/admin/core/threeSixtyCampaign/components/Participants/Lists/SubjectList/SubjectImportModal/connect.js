import { connect } from 'react-redux'
import { closeModal } from 'modules/admin/core/temp/modals'
import { IMPORT, importFile, clearImportData } from 'modules/admin/core/threeSixtyCampaign/subjects/import'

export default connect(
  ({
    temp: { modals: { current }, request: { loading, name: requestName } },
    threeSixtyCampaign: { subjects: { import: { errors, existingSubjectsWhosePasswordNotChanged } } },
  }) => ({
    current,
    importInProgress: requestName === IMPORT && loading,
    errors,
    existingSubjectsWhosePasswordNotChanged,
  }),
  {
    closeModal,
    importFile,
    clearImportData,
  },
)
