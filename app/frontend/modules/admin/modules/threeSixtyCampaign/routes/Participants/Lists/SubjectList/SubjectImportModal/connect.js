import { connect } from 'react-redux'
import { closeModal, getCurrent } from '~/modules/admin/core/ui/modals'
import {
  IMPORT,
  importFile,
  clearImportData,
  get as getImport,
} from '~/modules/admin/modules/threeSixtyCampaign/core/subjects/import'
import { isRequestInProgress } from '~/core/request'

export default connect(
  (state) => {
    const { errors, existingSubjectsWhosePasswordNotChanged } = getImport(state)

    return {
      current: getCurrent(state),
      importInProgress: isRequestInProgress(state, IMPORT),
      errors,
      existingSubjectsWhosePasswordNotChanged,
    }
  },
  {
    closeModal,
    importFile,
    clearImportData,
  },
)
